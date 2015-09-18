var ref = new Firebase('https://sghackatron.firebaseio.com');
var ballotsRef = ref.child("ballots");
var projectsRef = ref.child("projects");

var ballots, projects, totals = [];

projectsRef.on("value", function(snapshot) {
  projects = snapshot.val();
  ballotsRef.on("value", function(snapshot) {
    ballots = snapshot.val();    
    _.each(projects, function(p) {
      totals.push({
        'id': p.id,
        'category_1': 0,
        'category_2': 0,
        'category_3': 0,
        'category_4': 0,
        'category_5': 0
      });
    });
    _.each(ballots, function(b) {
      var votes = b.votes;
      _.each(votes, function(v) {
        var cat = v.voting_category_id;
        var tot = totals[v.project_id];
        tot["category_" + cat] = tot["category_" + cat] + 1;
      });
    });
    var category_1 = _.sortBy(totals, function(t) {
      return t.category_1;
    });
    category_1.reverse();
    var category_1_results = "<ul>";
    _.each(category_1, function(c) {
      var line = "<li><span>" + c.category_1 + "</span> " + projects[c.id].name + "</li>";
      category_1_results +=line;
    });
    category_1_results += "</ul>";
    $("#category_1_results").html(category_1_results);

    var category_2 = _.sortBy(totals, function(t) {
      return t.category_2;
    });
    category_2.reverse();
    var category_2_results = "<ul>";
    _.each(category_2, function(c) {
      var line = "<li><span>" + c.category_2 + "</span> " + projects[c.id].name + "</li>";
      category_2_results +=line;
    });
    category_2_results += "</ul>";
    $("#category_2_results").html(category_2_results);

    var category_3 = _.sortBy(totals, function(t) {
      return t.category_3;
    });
    category_3.reverse();
    var category_3_results = "<ul>";
    _.each(category_3, function(c) {
      var line = "<li><span>" + c.category_3 + "</span> " + projects[c.id].name + "</li>";
      category_3_results +=line;
    });
    category_3_results += "</ul>";
    $("#category_3_results").html(category_3_results);

    var category_4 = _.sortBy(totals, function(t) {
      return t.category_4;
    });
    category_4.reverse();
    var category_4_results = "<ul>";
    _.each(category_4, function(c) {
      var line = "<li><span>" + c.category_4 + "</span> " + projects[c.id].name + "</li>";
      category_4_results +=line;
    });
    category_4_results += "</ul>";
    $("#category_4_results").html(category_4_results);

    var category_5 = _.sortBy(totals, function(t) {
      return t.category_5;
    });
    category_5.reverse();
    var category_5_results = "<ul>";
    _.each(category_5, function(c) {
      var line = "<li><span>" + c.category_5 + "</span> " + projects[c.id].name + "</li>";
      category_5_results +=line;
    });
    category_5_results += "</ul>";
    $("#category_5_results").html(category_5_results);


  });
});

$(function() {
  $('footer').hide();
  $('#fixed').css('box-shadow', 'none');
});