import path from 'path'
import * as fs from 'fs/promises'
import xml2js from 'xml2js'
import _ from 'lodash'
import { DateTime } from 'luxon'
import TurndownService from 'turndown'
import matter from 'gray-matter'
import domino from 'domino'
import { v2 as cloudinary } from 'cloudinary'

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
    key.match(/^_/) ||
    key.match(/^cloudinary_/) ||
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

  if(DateTime.fromSQL(output.wp_post_date_gmt, { zone: 'UTC' }).year < 2017) {
    return null
  } 

  // OK now add some stuff
  output.date = DateTime.fromSQL(output.wp_post_date_gmt, { zone: 'UTC' }).toISO()
  output.modified = DateTime.fromSQL(output.wp_post_modified_gmt, { zone: 'UTC' }).toISO() 

  if(_.includes(['post', 'page'], output.wp_post_type)) {
    var document = await replaceWpImages( getDocument(output.content) )
    output.markdown = turndownService.turndown(document)
  }

  if(output.wp_postmeta) {
    output.meta = unwrapMeta(output.wp_postmeta)
    delete output.wp_postmeta
  }

  return output
}

async function writePostToDisk(post) {
  const postDate = DateTime.fromISO(post.date)
  if(postDate.year < 2017) {
    return false
  }

  if(post.wp_post_name) {
    const postPath = `posts/${post.wp_post_name}.md`
  
    const fileContents = matter.stringify(post.markdown, _.omitBy({
      title: post.title,
      description: post.excerpt,
      slug: post.wp_post_name,
      modified: post.modified,
      date: post.date,
      ...post.meta,
    }, _.isEmpty))
  
    await fs.writeFile(postPath, fileContents)
  }
}

async function main() {
  const xmlData = await fs.readFile(path.resolve(process.cwd(), 'tmp/wpexport_2021-12-28.xml'))
  const result = await xml.parseStringPromise(xmlData)

  const channel = result.rss.channel[0]
  const items = await Promise.all(channel.item.map(unwrapValues)).then(items => _.compact(items))

  const posts = items.filter(i => (i['wp_post_type'] === 'post'))

  fs.mkdir("src/pages/posts", {recursive: true})
  posts.forEach(async post => {
    await writePostToDisk(post)
  })

}

main();