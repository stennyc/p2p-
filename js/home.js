;(function() {
  let id = location.href.split('=')[1]
  let number = ''
  $.ajax({
    url: 'http://money-api.9vdata.com/info',
    type: 'post',
    data: {
      id: +id
    },
    success: function(res) {
      // console.log(res.data.info)
      let list = res.data.info
      number = list.huankuan_number
      $('.statementContent').text(list.content)
      $('.huankuan').text(list.huankuan_date)
      $('.jiekuan').text(list.jiekuan_date)
      $('.chujie').text(list.chujie)
    }
  })

  //取消隐藏
  $('.title').on('click', function() {
    $(this).css({ display: 'none' })
  })

  //确认信息
  $('.btnsure').on('click', function() {
    let ary = []
    for (let i = 0; i < $('input').length; i++) {
      ary.push($('input')[i].value)
    }
    let arr = ary.filter(item => item == '')
    if (arr.length > 1) {
      $('.title').text('请输入完整信息')
      $('.title').css({ display: 'block' })
      return
    }

    if (
      $('.name')
        .val()
        .trim() === ''
    ) {
      $('.title').text('请输入借款姓名')
      $('.title').css({ display: 'block' })
      return
    }

    if (!/^1(3|4|5|7|8)\d{9}$/.test($('.phone').val())) {
      $('.title').text('手机号码格式错误')
      $('.title').css({ display: 'block' })
      return
    }

    if (
      !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/.test(
        $('.card').val()
      )
    ) {
      $('.title').text('身份证输入不合法')
      $('.title').css({ display: 'block' })
      return
    }

    if (!/^[0-9]*$/.test($('.money').val())) {
      $('.title').text('请输入借款金额')
      $('.title').css({ display: 'block' })
      return
    }

    let obj = {
      chujie: $('.chujie').text(),
      content: $('.statementContent').text(),
      jiekuan_date: $('.jiekuan').text(),
      number: number,
      jiekuanren: $('.name').val(),
      mobile: $('.phone').val(),
      id_card: $('.card').val(),
      money: $('.money').val()
    }
    let a = JSON.stringify(obj)
    localStorage.setItem('jiekuan_hetong', a)
    window.location.href = './signature.html'
  })
})()
