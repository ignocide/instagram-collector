'use strict'

var Images = function (list) {
  var arr = []

  arr = arr.concat.apply(arr, list || [])
  arr.__proto__ = Images.prototype
  return arr
}
Images.prototype = []

Images.prototype.thumbnails = function () {
  var thumbnails = []
  for (var image of this) {
    var thumbnail = image.images.thumbnail
    thumbnail.id = image.id
    thumbnails.push(thumbnail)
  }
  return thumbnails
}

Images.prototype.lows = function () {
  var lows = []
  for (var image of this) {
    var low = image.images.low_resolution
    low.id = image.id
    lows.push(low)
  }
  return lows
}

Images.prototype.standards = function () {
  var standards = []
  for (var image of this) {
    var standard = image.images.standard_resolution
    standard.id = image.id
    standards.push(standard)
  }
  return standards
}

module.exports = Images
