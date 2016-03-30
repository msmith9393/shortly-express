Shortly.Router = Backbone.Router.extend({
  initialize: function(options) {
    this.$el = options.el;
  },

  routes: {
    '': 'index',
    'create': 'create'
  },

  swapView: function(view) {
    console.log('swapView called in router');
    this.$el.html(view.render().el);
  },

  index: function() {
    console.log('index called in router');
    var links = new Shortly.Links();
    var linksView = new Shortly.LinksView({ collection: links });
    this.swapView(linksView);
  },

  create: function() {
    console.log('create called in router');
    this.swapView(new Shortly.createLinkView());
  }
});
