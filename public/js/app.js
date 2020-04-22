'use strict'

$(document).ready(() => {
    $('.toggleform').hide();
    $('.toggle').on('click', () => {
        $('.toggleform').toggle();
    })
})