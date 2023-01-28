const wpToMarkdown = require('./wpToMarkdown')

const exampleText = `
<!-- wp:paragraph -->
<p>I've been intrigued by <a href="https://en.wikipedia.org/wiki/Fujifilm_X100" title="Wikipedia page for Fuji camera" target="_blank">Fuji's X100 lineup</a> for a while, and a couple of weeks ago I got the new fifth-generation <a href="https://fujifilm-x.com/en-us/products/cameras/x100v/">Fuji X100V</a> as my new vacation and street photography camera.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":5329,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://demaree.blog/wp-content/uploads/2021/07/DSCF0626.jpg" alt="" class="wp-image-5329"/><figcaption>Maplewood, NJ's main fire station. In-camera JPEG from Fuji X100V with Velvia film simulation</figcaption></figure>
<!-- /wp:image -->

<!-- wp:gallery {"ids":[5315,5323,5331,5320],"columns":2,"linkTo":"none","align":"wide"} -->
<figure class="wp-block-gallery alignwide columns-2 is-cropped"><ul class="blocks-gallery-grid"><li class="blocks-gallery-item"><figure><img src="https://demaree.blog/wp-content/uploads/2021/07/DSCF0274.jpg" alt="" data-id="5315" data-link="https://demaree.blog/?attachment_id=5315" class="wp-image-5315"/></figure></li><li class="blocks-gallery-item"><figure><img src="https://demaree.blog/wp-content/uploads/2021/07/DSCF0424.jpg" alt="" data-id="5323" data-full-url="https://demaree.blog/wp-content/uploads/2021/07/DSCF0424.jpg" data-link="https://demaree.blog/?attachment_id=5323" class="wp-image-5323"/></figure></li><li class="blocks-gallery-item"><figure><img src="https://demaree.blog/wp-content/uploads/2021/07/DSCF0584.jpg" alt="" data-id="5331" data-full-url="https://demaree.blog/wp-content/uploads/2021/07/DSCF0584.jpg" data-link="https://demaree.blog/?attachment_id=5331" class="wp-image-5331"/></figure></li><li class="blocks-gallery-item"><figure><img src="https://demaree.blog/wp-content/uploads/2021/07/DSCF0546.jpg" alt="" data-id="5320" data-link="https://demaree.blog/?attachment_id=5320" class="wp-image-5320"/></figure></li></ul></figure>
<!-- /wp:gallery -->

<!-- wp:paragraph -->
<p>But part of the fun of this camera is trying to <em>not</em> spend as much time in Lightroom, and instead just trust what comes out of the camera. One set of black and white modes is patterned after Fuji's ACROS film stock, and you can set it to be more sensitive to red, green, or yellow, which result in different looks depending on the scene.</p>
<!-- /wp:paragraph -->
`

test("basic paragraph syntax", () => {
  const sample = `
<!-- wp:paragraph -->
<p><em>The internet</em> is indeed made of people just like <a href="https://en.wikipedia.org/wiki/Soylent_Green">Soylent Green</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Bicycle rights raw denim truffaut, hoodie +1 before they sold out vinyl.</p>
<!-- /wp:paragraph -->
`

  var result = wpToMarkdown(sample)
  expect(result).toEqual("_The internet_ is indeed made of people just like [Soylent Green](https://en.wikipedia.org/wiki/Soylent_Green)\n\nBicycle rights raw denim truffaut, hoodie +1 before they sold out vinyl.")
})

test("link with title and formatting", () => {
  const sample = `
<!-- wp:paragraph -->
<p><a href="https://en.wikipedia.org/wiki/Soylent_Green" title="Wikipedia page for Soylent Green">The 70s sci-fi movie <em>Soylent Green</em></a></p>
<!-- /wp:paragraph -->
`

  var result = wpToMarkdown(sample)
  expect(result).toEqual("[The 70s sci-fi movie _Soylent Green_](https://en.wikipedia.org/wiki/Soylent_Green \"Wikipedia page for Soylent Green\")")
})

test("preserve link HTML if non-MD attrs are present", () => {
  const sample = `
<!-- wp:paragraph -->
<p>Only a cannibal would <a href="https://en.wikipedia.org/wiki/Soylent_Green" target="_blank">open a link in a new window</a></p>
<!-- /wp:paragraph -->
`

  var result = wpToMarkdown(sample)
  expect(result).toEqual("Only a cannibal would <a href=\"https://en.wikipedia.org/wiki/Soylent_Green\" target=\"_blank\">open a link in a new window</a>")
})

test("bulleted lists", () => {
  const listSample = `
  <!-- wp:list -->
  <ul><li>Seeing <em>far more</em> of what’s going on than they are used to</li><li>People’s lives being on fire, because the world is on fire</li></ul>
  <!-- /wp:list -->
  `

  var result = wpToMarkdown(listSample)
  expect(result).toEqual("- Seeing _far more_ of what’s going on than they are used to\n- People’s lives being on fire, because the world is on fire");
})

test("ordered lists", () => {
  const listSample = `
  <!-- wp:list {"ordered":true} -->
  <ol><li>Seeing <em>far more</em> of what’s going on than they are used to</li><li>People’s lives being on fire, because the world is on fire</li></ol>
  <!-- /wp:list -->
  `

  var result = wpToMarkdown(listSample)
  expect(result).toEqual("1. Seeing _far more_ of what’s going on than they are used to\n2. People’s lives being on fire, because the world is on fire");
})

test("nested lists", () => {
  const listSample = `
  <!-- wp:paragraph -->
  <p>I'm baby gentrify enamel pin synth banjo. Live-edge brooklyn tilde, pour-over hell of pickled green juice health goth salvia fanny pack pitchfork venmo truffaut kombucha.</p>
  <!-- /wp:paragraph -->

  <!-- wp:list {"ordered":true} -->
  <ol><li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.<ul><li>Lumbersexual cloud bread church-key butcher skateboard blue bottle.</li></ul></li></ol>
  <!-- /wp:list -->
  `

  var result = wpToMarkdown(listSample)
  expect(result).toEqual("I'm baby gentrify enamel pin synth banjo. Live-edge brooklyn tilde, pour-over hell of pickled green juice health goth salvia fanny pack pitchfork venmo truffaut kombucha.\n\n1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.\n    - Lumbersexual cloud bread church-key butcher skateboard blue bottle.");
})

test("simple blockquotes", () => {
  const listSample = `
  <!-- wp:paragraph -->
  <p>I'm baby gentrify enamel pin synth banjo.</p>
  <!-- /wp:paragraph -->

  <!-- wp:quote -->
  <blockquote class="wp-block-quote"><p>Viral artisan chicharrones forage cronut adaptogen sartorial 3 wolf moon prism shoreditch.</p></blockquote>
  <!-- /wp:quote -->
  `

  var result = wpToMarkdown(listSample)
  expect(result).toEqual("I'm baby gentrify enamel pin synth banjo.\n\n> Viral artisan chicharrones forage cronut adaptogen sartorial 3 wolf moon prism shoreditch.");
})

test("lists inside blockquotes", () => {
  const listSample = `
  <blockquote>
  <ul>
  <li><strong>Free</strong> Dreamcatcher sriracha four loko.</li>
  <li><strong>One-time Purchase</strong> Pop-up poke fingerstache meggings!</li>
  </ul>
  </blockquote>
  `

  var result = wpToMarkdown(listSample)
  expect(result).toEqual("> - **One-time Purchase** Pop-up poke fingerstache meggings!");
})

