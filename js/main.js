/**
 * jTinder initialization
 */

var jTinderConfig = {
  onDislike: function (item) {
    $('#status').html('Dislike image ' + (item.index()+1));
  },
  onLike: function (item) {
    $('#status').html('Like image ' + (item.index()+1));
  },
	animationRevertSpeed: 200,
	animationSpeed: 400,
	threshold: 1,
	likeSelector: '.like',
	dislikeSelector: '.dislike'
};

$("#tinderslide-a").jTinder(jTinderConfig);
$("#tinderslide-b").jTinder(jTinderConfig);

/**
 * Set button action to trigger jTinder like & dislike.
 */
$('.actions .like, .actions .dislike').click(function(e){
	e.preventDefault();
	$("#tinderslide").jTinder($(this).attr('class'));
});
