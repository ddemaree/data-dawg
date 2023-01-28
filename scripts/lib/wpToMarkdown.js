const _ = require('lodash')
const domino = require('domino');
var Element = domino.impl.Element;

const formatters = {
  em: node => formatPhrase(node, '_'),
  i: node => formatPhrase(node, '_'),
  strong: node => formatPhrase(node, '**'),
  b: node => formatPhrase(node, '**'),
  code: node => formatPhrase(node, '`'),
  a: node => processLink(node),
  p: node => processBlock(node),
  ul: (node, level) => processList(node, false, level),
  ol: (node, level) => processList(node, true, level),
  blockquote: (node, level) => processQuote(node, level),
  '#text': node => node.outerHTML.trim(),
}

function getAttributes(node, omitted = []) {
  const attrs = node.attributes
  let output = {}
  for(var i = attrs.length - 1; i >= 0; i--) {
    const thisAttr = attrs[i]
    output[thisAttr.name] = thisAttr.value
  }
  return _.omit(output, omitted)
}

function processQuote(node, quoteLevel = 0) {
  var output = []
  var prefix = '> '.repeat(quoteLevel + 1)

  node.childNodes.forEach((child, index) => {
    var nodeName = child.nodeName.toLowerCase()
    var formatter = formatters[nodeName]
    if(formatter) output.push(formatter(child))
  })

  // return output.map(line => `${prefix}${line}`).join('\n')
  return output.join('\n')
}

function processList(node, ordered = false, level = 0) {
  let output = []
  if(level > 0) output.push('')

  node.childNodes.forEach((child, index) => {
    var nodeName = child.nodeName.toLowerCase()
    if(nodeName === '#text') {
      // skip
    }
    else {
      var content = processBlock(child, level + 1)
      var prefix = ordered ? `${index + 1}. ` : `- `
      var indent = `    `.repeat(level)
      output.push(`${indent}${prefix}${content}`)
    }
  })

  console.log(_.compact(output))
  return _.compact(output).join('\n')
}

function formatPhrase(node, sigil = "") {
  return `${sigil}${processBlock(node)}${sigil}`
}

function processLink(node, endnoteStyle = false) {
  var text = processBlock(node)
  var href = node.href
  var title = node.title

  var attrs = getAttributes(node, ['href', 'title'])

  // preserve link markup that has non-MD attributes
  if(!_.isEmpty(attrs)) {
    console.log(attrs)
    return node.outerHTML
  } else {
    // TODO add support for endnoteStyle
    var mdHref = title ? `${href} "${title}"` : href
    return `[${text}](${mdHref})`
  }
}

function processBlock(node, level = 0) {
  let segments = []

  node.childNodes.forEach(child => {
    if(child.nodeName === '#text') {
      segments.push(child.outerHTML)
    }
    else {
      if(child instanceof Element) {
        var nodeName = child.nodeName.toLowerCase()
        var formatter = formatters[nodeName]
        if(formatter) {
          segments.push(formatter(child, level))
        }
        else {
          console.log(nodeName)
          segments.push(processBlock(child, level))
        }
      }
    }
  })

  return segments.join("")
}

module.exports = function wpToMarkdown(content) {
  var window = domino.createWindow(content, 'https://demaree.blog');
  var document = window.document;
  let blocks = []

  document.body.childNodes.forEach(node => {
    var nodeName = node.nodeName.toLowerCase()
    var formatter = formatters[nodeName]

    if(nodeName === '#text' || nodeName === '#comment') {
      // Skip
      /* There shouldn't be top level text nodes in a WP export */ 
    }
    else if(formatter) {
      blocks.push(formatter(node))
    }
    else {
      console.log(nodeName, node.outerHTML, node.classList)
      blocks.push(node.outerHTML)
    }
  })
  
  return blocks.join("")
}