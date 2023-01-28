import path from 'path'
import * as fs from 'fs/promises'
import xml2js from 'xml2js'
import _ from 'lodash'
import { DateTime } from 'luxon'
import TurndownService from 'turndown'
import matter from 'gray-matter'
import domino from 'domino'
import { v2 as cloudinary } from 'cloudinary'
import PHPUnserialize from 'php-unserialize'

cloudinary.config({ 
  cloud_name: 'demaree', 
  api_key: '368263453154131', 
  api_secret: '52MW1MKr0A_6YnmkmQd_FzkHCpM',
  secure: true
});

const xml = new xml2js.Parser({ attrkey: "_attrs" })
const turndownService = new TurndownService({ headingStyle: 'atx' })

turndownService.keep(['figure', 'div'])

let cloudinaryData = {}
async function getCloudinaryData() {
  const dataString = await fs.readFile('tmp/cloudinary_assets.json')
  const data = JSON.parse(dataString)
  cloudinaryData = data.resources
}

let attachmentData = {}

function getDocument(content) {
  var string = '<x-turndown id="turndown-root">' + content + '</x-turndown>';
  return domino.createDocument(string)
}

async function replaceWpImages(document) {
  await getCloudinaryData()
  document.querySelectorAll('img[class^=wp-image-]').forEach(async node => {
    var imageId = node.className.replace('wp-image-', '')

    var asset = cloudinaryData.filter(item => (_.isEqual(_.get(item, 'context.custom.wp_id'), imageId) && item.public_id.match(/^bitsandletters/)))[0]

    if(asset) {
      node.setAttribute('data-original-src', node.src)
      node.src = asset.secure_url
    }
  })

  return document
}

function canEmbedMetaKey(key) {
  const skipKeys = ['primary_tag']

  return !(
    _.includes(skipKeys, key) ||
    key.match(/rank_math/) ||
    key.match(/^_\d/) ||
    key.match(/^_*cloudinary_/) ||
    key.match(/^jetpack_/)
  )
}

function unwrapMeta(meta) {
  if(!meta) return meta

  let output = {}
  meta.forEach(item => {
    let key = item['wp:meta_key'][0]
    let value = item['wp:meta_value'][0]

    if(canEmbedMetaKey(key) && !_.isEmpty(value)) {
      output[key] = value
    }
  })

  return output
}

async function unwrapValues(item) {
  let output = {}

  const alwaysArray = ['category', 'wp:postmeta']
  const keys = Object.getOwnPropertyNames(item)

  keys.forEach(async key => {
    const value = item[key]
    let newValue = value
    let newKey = key

    if(_.includes(alwaysArray, key) || value.length > 1) {
      newValue = value
    } else {
      newValue = value[0]
    }

    if(newKey.match(/\:encoded$/)) {
      newKey = newKey.replace(':encoded', '')
    } else if(newKey.match(/^wp\:/)) {
      newKey = newKey.replace('wp:', 'wp_')
    }

    output[newKey] = newValue
  })

  if(DateTime.fromSQL(output.wp_post_date_gmt, { zone: 'UTC' }).year < 2004) {
    return null
  } 

  // OK now add some stuff
  output.date = DateTime.fromSQL(output.wp_post_date_gmt, { zone: 'UTC' }).toISO()
  output.modified = DateTime.fromSQL(output.wp_post_modified_gmt, { zone: 'UTC' }).toISO() 

  if(output.wp_postmeta) {
    output.meta = unwrapMeta(output.wp_postmeta)
    delete output.wp_postmeta
  }

  if(_.includes(['post', 'page'], output.wp_post_type)) {
    var document = await replaceWpImages( getDocument(output.content) )

    if(output.meta._thumbnail_id) {
      const featuredImage = attachmentData[ output.meta._thumbnail_id ];

      if(featuredImage) {
        const imageFigureTag = document.createElement('figure')
        imageFigureTag.className = "wp-block-image alignwide"
        const imageTag = document.createElement('img')
        imageTag.src = featuredImage.wp_attachment_url
        imageTag.setAttribute("alt", featuredImage.meta._wp_attachment_image_alt)

        var { width, height } = featuredImage.wp_metadata 
        var aspectRatio = parseFloat(width) / parseFloat(height)
        var imageWidth  = width > 2000 ? 2000 : width
        var imageHeight = Math.floor(imageWidth / aspectRatio)
        imageTag.width  = imageWidth
        imageTag.height = imageHeight

        if(featuredImage.unsplash_metadata) {
          var unsplashUrl = new URL(featuredImage.meta.original_url)
          unsplashUrl.search += `&w=${imageWidth}&h=${imageHeight}`

          imageTag.src = unsplashUrl.href
          imageTag.setAttribute('data-wp-url', featuredImage.wp_attachment_url)
        }

        imageFigureTag.appendChild(imageTag)

        var rootElem = document.documentElement.querySelector('x-turndown')
        var refElem = rootElem.firstChild
        rootElem.insertBefore(imageFigureTag, refElem)
      }
    }

    output.markdown = turndownService.turndown(document)
  }
  else if(output.wp_post_type === 'attachment') {
    try {
      if(output.meta.unsplash_attachment_metadata) {
        output.source = 'unsplash'
        output.unsplash_metadata = PHPUnserialize.unserialize(output.meta.unsplash_attachment_metadata)
        delete output.meta.unsplash_attachment_metadata
      }
      if(output.meta._wp_attachment_metadata) {
        output.wp_metadata = PHPUnserialize.unserialize(output.meta._wp_attachment_metadata)
        delete output.meta._wp_attachment_metadata 
      }
    } catch(e) {
      console.log(e)
    }

    attachmentData[output['wp_post_id']] = output
  }

  return output
}

async function writePostToDisk(post) {
  let fileContents = "";
  const postDate = DateTime.fromISO(post.date)
  const filenameDate = postDate.toISODate()

  let postFrontData = {
    title: post.title,
    description: post.excerpt,
    slug: post.wp_post_name,
    modified: post.modified,
    date: post.date,
    ...post.meta,
  }

  function omitKey(value, key) {
    return !_.isBoolean(value) && (_.isEmpty(value) || key.match(/^_/))
  }

  if(post.wp_post_name) {
    let fileExists = null;
    const postPath = `./posts/${filenameDate}-${post.wp_post_name}.md`

    try {
      fileExists = await fs.stat(postPath)
    } catch(e) {
    }

    if(fileExists) {
      const fileData = matter.read(postPath)

      postFrontData = {
        ...postFrontData,
        ...fileData.data
      }
    }
    
    postFrontData = _.omitBy(postFrontData, omitKey)
    
    fileContents = matter.stringify(post.markdown, postFrontData)

    console.log(`Writing ${postPath}`)
    await fs.writeFile(postPath, fileContents)
  }
}

async function main() {
  const xmlData = await fs.readFile(path.resolve(process.cwd(), 'tmp/wpexport_2021-12-28.xml'))
  const result = await xml.parseStringPromise(xmlData)

  const channel = result.rss.channel[0]
  const items = await Promise.all(channel.item.map(unwrapValues)).then(items => _.compact(items))

  const posts = items.filter(i => (i['wp_post_type'] === 'post'))

  await fs.rm("./posts", {recursive: true})
  await fs.mkdir("./posts", {recursive: true})
  posts.forEach(async post => {
    await writePostToDisk(post)
  })
}

main();