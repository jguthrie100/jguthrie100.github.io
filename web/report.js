$(function() {
  $.ajaxSetup({ cache: false });
  buildMenu1();
  buildMenu2();

  $("#view1Button").click(function() {
    $("#view2").hide();
    $("#view1").show();
  });
  $('#view2Button').click(function() {
    $("#view1").hide();
    $("#view2").show();
  });
});

function buildMenu1() {
  // Grab list of valid dates from the server and build calendar menu
  $.getJSON({url: "data/meta_data/dates.json", success: function(dates) {
    $("#datepicker").datepicker({
      beforeShowDay: function(date) {
        return [dates.includes(dateString(date)), ''];
      },
      dateFormat: "yy-mm-dd",
      onSelect: function(date) {
        buildView1(date);
      }
    });
  }});
}

function buildMenu2() {
  // Grab list of device types and statuses and build dropdown menu
  $.getJSON({url: "data/meta_data/types_and_statuses.json", success: function(types) {

    $("#view2 #optionsMenu .dropdown-menu").append(`<li class="dropdown-divider">Device Types</li>`);
    for(var i = 0; i < types["types"].length, type = types["types"][i]; i++) {
      $("#view2 #optionsMenu .dropdown-menu").append(`<li class="dropdown-option" data-type="type" data-value="${type}"><a href="#">${type}</a></li>`);
    }

    $("#view2 #optionsMenu .dropdown-menu").append(`<li class="dropdown-divider">Status Values</li>`);
    for(var i = 0; i < types["statuses"].length, status = types["statuses"][i]; i++) {
      $("#view2 #optionsMenu .dropdown-menu").append(`<li class="dropdown-option" data-type="status" data-value="${status}"><a href="#">${status}</a></li>`);
    }

    $('#view2 .dropdown-option').click(function() {
      buildView2($(this)[0].dataset.type, $(this)[0].dataset.value);
    });
  }});
}

function buildView1(date) {
    $("#view1Display h3").html(`Most popular devices on ${(new Date(date)).toString().split(" ").slice(1, 4).join(" ")}`);
    $("#view1Display tbody").empty();
    $("#view1Display").show();

    $.getJSON({url: `data/view1_data/${date.slice(0, 7)}/sorted_by_freq-${date}.json`, success: function(totals) {
      for(var i = 0; i < totals.length; i++) {
        $("#view1Display tbody").append(`<tr><td>${totals[i][0]}</td><td>${totals[i][1]}</td><td>${totals[i][2]}</td><td>${totals[i][3]}</td><tr>`);
      }
    }});
}

function buildView2(type, value) {
  type == "type" ? types = "types" : types = "statuses";

  var date = new Date(2017, 04, 15);     //var date = new Date();  // csv data is from more than 30 days before today, so manually set earlier date
  var dateFrom = new Date(date.getTime());
  dateFrom.setDate(dateFrom.getDate()-29);

  $("#view2Display h3").html(`List of <strong>${value}</strong> devices from ${(new Date(dateFrom)).toString().split(" ").slice(1, 4).join(" ")} - ${(new Date(date)).toString().split(" ").slice(1, 4).join(" ")}`);
  $("#view2Display tbody").empty();
  $("#view2Display").show();

  $.getJSON({url: `data/view2_data/${type}-${value}-summary.json`, success: function(d) {
    for(var i = 0; i < 30; i++) {
      var dateStr = dateString(date);
      date.setDate(date.getDate()-1);

      if(d[dateStr] === undefined) {
        continue;
      }

      $("#view2Display tbody").append(`<tr><td>${dateStr}</td><td><div style="background-color:#33cc33;width:${d[dateStr]*3}px">&nbsp;${d[dateStr]}</div></td></tr>`);
    }
  }});
}

function dateString(date) {
  return `${date.getFullYear()}-${("00" + (date.getMonth()+1)).slice(-2)}-${("00" + date.getDate()).slice(-2)}`;
}
