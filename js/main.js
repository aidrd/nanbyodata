$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
  })

  $(function(){
    var nav = $('.navbar')
    var header_height = 550;
    
    $(window).scroll(function () {
    
    if($(window).scrollTop() > header_height) {
    nav.addClass('scroll');
    }else {
    nav.removeClass('scroll');
    }
    });
    });