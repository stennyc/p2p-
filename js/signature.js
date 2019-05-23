let obj = JSON.parse(localStorage.getItem('jiekuan_hetong'))

function Handwriting(id) {
  this.hand = document.querySelector('.hand')
  this.canvas = document.getElementById(id)
  this.ctx = this.canvas.getContext('2d')
  var on = {
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend'
  }

  this.canvas.addEventListener(on.start, this.downEvent.bind(this), false)
  this.canvas.addEventListener(on.move, this.moveEvent.bind(this), false)
  this.canvas.addEventListener(on.end, this.upEvent.bind(this), false)
  this.canvas.addEventListener(
    'contextmenu',
    function(e) {
      e.preventDefault()
    },
    false
  )
  this.moveFlag = false
  this.upof = {}
  this.radius = 0
  this.has = []
  this.startOf = null
  this.lineMax = 30
  this.lineMin = 10
  this.linePressure = 1
  this.smoothness = 30
  this.history = []
  this.setColor('rgba(0,0,0,0.25)')
}

Handwriting.prototype.save = function() {
  var imgData = this.ctx.getImageData(
    0,
    0,
    this.canvas.width,
    this.canvas.height
  ).data
  var lOffset = this.canvas.width,
    rOffset = 0,
    tOffset = this.canvas.height,
    bOffset = 0
  for (var i = 0; i < this.canvas.width; i++) {
    for (var j = 0; j < this.canvas.height; j++) {
      var pos = (i + this.canvas.width * j) * 4
      if (
        imgData[pos] > 0 ||
        imgData[pos + 1] > 0 ||
        imgData[pos + 2] ||
        imgData[pos + 3] > 0
      ) {
        bOffset = Math.max(j, bOffset) // 找到有色彩的最下端
        rOffset = Math.max(i, rOffset) // 找到有色彩的最右端

        tOffset = Math.min(j, tOffset) // 找到有色彩的最上端
        lOffset = Math.min(i, lOffset) // 找到有色彩的最左端
      }
    }
  }
  lOffset++
  rOffset++
  tOffset++
  bOffset++
  var c = document.createElement('canvas')
  c.width = rOffset - lOffset
  c.height = bOffset - tOffset
  var ctxs = c.getContext('2d')
  ctxs.drawImage(
    this.canvas,
    lOffset,
    tOffset,
    c.width,
    c.height,
    0,
    0,
    c.width,
    c.height
  )
  var url = c.toDataURL('image/png'),
    // imgDiv = document.getElementById('imgDiv')
    img = new Image()
  // console.log($(c).attr('width'))
  if ($(c).attr('width') == 300) {
    return
  }
  img.src = url
  img.width = '50'
  img.height = '50'
  var bs = c.width / c.height
  // imgDiv.appendChild(img)
  let imgUrl = $(img).attr('src')
  obj.qianming_url = imgUrl

  this.history = []
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  $.ajax({
    type: 'post',
    url: 'http://money-api.9vdata.com/create',
    data: obj,
    success: function(res) {
      $('.motaik').css({ display: 'block' })
    }
  })
}

Handwriting.prototype.clear = function() {
  this.hand.style.display = 'block'
  this.history = []
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  //	document.getElementById('imgDiv').innerHTML="";
}
Handwriting.prototype.downEvent = function(e) {
  this.hand.style.display = 'none'
  this.moveFlag = true
  this.has = []
  this.upof = this.getXY(e)
  this.startOf = this.upof
}

Handwriting.prototype.moveEvent = function(e) {
  if (!this.moveFlag) return
  e.preventDefault()
  var of = this.getXY(e)
  var up = this.upof
  var ur = this.radius
  this.has.unshift({
    time: new Date().getTime(),
    dis: this.distance(up, of)
  })
  var dis = 0
  var time = 0
  for (var n = 0; n < this.has.length - 1; n++) {
    dis += this.has[n].dis
    time += this.has[n].time - this.has[n + 1].time
    if (dis > this.smoothness) break
  }
  var or =
    Math.min((time / dis) * this.linePressure + this.lineMin, this.lineMax) / 2
  this.radius = or
  this.upof = of
  if (dis < 7) return
  if (this.startOf) {
    up = this.startOf
    ur = or
    this.startOf = null
    this.history.push([])
  }
  var len = Math.ceil(this.distance(up, of) / 2)
  for (var i = 0; i < len; i++) {
    var x = up.x + ((of.x - up.x) / len) * i
    var y = up.y + ((of.y - up.y) / len) * i
    var r = ur + ((or - ur) / len) * i
    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, 2 * Math.PI, true)
    this.ctx.fill()
    this.history[this.history.length - 1].push(x, y, r)
  }
}

Handwriting.prototype.upEvent = function(e) {
  this.moveFlag = false
}

Handwriting.prototype.getXY = function(e) {
  var et = e.touches ? e.touches[0] : e
  var x = et.clientX
  var y = et.clientY
  return {
    x:
      x -
      this.canvas.offsetLeft +
      (document.body.scrollLeft || document.documentElement.scrollLeft),
    y:
      y -
      this.canvas.offsetTop +
      (document.body.scrollTop || document.documentElement.scrollTop)
  }
}

Handwriting.prototype.distance = function(a, b) {
  var x = b.x - a.x,
    y = b.y - a.y
  return Math.sqrt(x * x + y * y)
}

Handwriting.prototype.setColor = function(c) {
  this.ctx.fillStyle = c
}

var hw = new Handwriting('canvasId')
hw.setColor('black') //设置画笔颜色
hw.lineMax = 2 //设置画笔最大线宽
hw.lineMin = 2 //设置画笔最小线宽
hw.linePressure = 1.2 //设置画笔笔触压力
hw.smoothness = 30 //设置画笔笔触大小变化的平滑度。

$('.btnCanel').on('click', function() {
  $('.motaik').css({ display: 'none' })
  localStorage.removeItem('jiekuan_hetong')
  // window.location.href = null
  window.location.href = './home.html'
})
$('.button3').on('click', function() {
  window.location.href = './home.html'
})
