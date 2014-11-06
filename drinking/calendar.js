
/*
* Copyright (C) 2014 mru@sisyphus.teil.cc
*/


(function( factory ) {
  factory( jQuery );
}(function( $ ) {
  'use strict';

  $.widget('ui.calendar_week', {
    version: '0.1',
    defaultElement: '<tr>',
    options: {
      year: null,
      week: null
    },
    is_current_ww: function() {
      var now = new Date();
      return now.getFullYear() == this.options.year && now.getWeek() == this.options.week;
    },
    _create: function() {
      this.element.addClass('calendar-ww-' + this.options.year+'-'+this.options.week);
      if (this.is_current_ww()) {
        this.element.addClass("calendar-ww-current");
      }
    }
  });

  return $.ui.calendar_week;
  
}));

(function( factory ) {
  factory( jQuery );
}(function( $ ) {
  'use strict';

function formatDate(date) {
  console.assert(date != null);
  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  return date.getFullYear()+"-"+(month)+"-"+(day) ;
}
  $.widget('ui.calendar_day', {
    version: '0.1',
    defaultElement: '<td>',
    options: {
      date: null,
      date_formatted: null,
      month: null
    },
    is_today: function() {
      return formatDate(this.options.date) == formatDate(new Date());
    },
    _create: function() {
      console.assert(this.options.date != null);

      this.element.addClass('calendar-day');
      this.element.text(this.options.date.getDate());
      this.options.date_formatted = formatDate(this.options.date);
      this.element.addClass('calendar-day-' + formatDate(this.options.date));
      if (this.options.date.getMonth() == this.options.month-1) {
        if (this.is_today()) {
          this.element.addClass('calendar-day-today');
        }
        this.element.addClass('calendar-day-inmonth');
      }
      else {
        this.element.addClass('calendar-day-othermonth');
      }
    }
  });

  return $.ui.calendar_day;
  
}));

(function( factory ) {
  factory( jQuery );
}(function( $ ) {

  'use strict';

  $.widget('ui.calendar', {

    version: '0.1',
    defaultElement: '<div>',
    widgetEventPrefix: "calendar",
    options: {
      year: 2014,
      first_dow: "Mon", /* or: "Sun"... untested */
      month: 3,
      select_day: null /* or: date object, or: "YYYY-MM-DD" string */
    },
    format_title: function() {
      return this.get_month_name(this.options.month-1) + " " + this.options.year;
    },
    select_day: function(date) {
      $('.calendar-day-selected').removeClass('calendar-day-selected');
      this.element.find('.calendar-day-'+formatDate(date)).addClass('calendar-day-selected');
    },
    _on_click_date: function(elem) {
      var date = elem.calendar_day('option', 'date');
      var allowed = this._trigger("dateselected", null, date);
      if (allowed !== false) {
        this.select_day(date);
      }
    },

    get_days_in_month: function(year, month) {
      var days = [];
      for (var d = 1; ; d++) {
        var date = new Date(year, month -1, d);

        if (date.getMonth() != month-1) {
          return days
        }

        days.push(date);
      }
    },
    get_weeks_in_month: function(days_in_month) {
      console.assert(days_in_month != null);
      console.assert(days_in_month.length > 27);
      var first_day = days_in_month[0];
      var weeks = [];
      var current_week = [];

      var fdow_correction = 0;
      if (this.options.first_dow == "Mon") {
        fdow_correction = 1;
      }
      // XXX there is an ugly conversion between week-start = sunday or week-start=monday
      // this is all the +- 1 stuff.
      for( var d = 0; d < first_day.getDay()-fdow_correction; d++) {
        current_week.push(new Date(first_day.getFullYear(), first_day.getMonth(), d - first_day.getDay()+(1+fdow_correction)));
      }

      days_in_month.forEach(function (d) {
        current_week.push(d);
        if (current_week.length == 7) {
          weeks.push(current_week);
          current_week = [];
        }
      });

      if (current_week.length != 0) {
        var i = 1;
        while(current_week.length < 7) {
          current_week.push(new Date(first_day.getFullYear(), first_day.getMonth(), days_in_month[days_in_month.length-1].getDate() + i++));
        }
        weeks.push(current_week);
      }
      return weeks;

    },
    get_month_names: function() {
      return [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" 
      ];
    },
    get_month_name: function(month) {
      // 0-based month
      console.assert(month >=0 && month < 12);
      return this.get_month_names()[month];
    },
    get_weekday_names: function() {
      if (this.options.first_dow == "Mon") {
        return [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ];
      }

      if (this.options.first_dow == "Sun") {
        return [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
      }

      console.assert (false && "unknown first day of week");
    },
    get_weekday_name: function(weekday) {
      console.assert(weekday >= 0 && weekday < 7);
      return this.get_weekday_names()[weekday];
    },
    _create: function() {

      var that = this;
      this.element.addClass("calendar");

      var title = $('<div>');
      title.text(this.format_title());
      title.addClass('calendar-title');
      this.element.append(title);

      var table = $('<table>');
      table.css('width', '100%');
      table.addClass('calendar-table');
      this.element.append(table);
  


      var dim = this.get_days_in_month(this.options.year, this.options.month);
      var wim = this.get_weeks_in_month(dim);

      var tr = $('<tr>');
      table.append(tr);
      var td = $('<td>');
      tr.append(td);
      this.get_weekday_names().forEach(function(week_day) {
        var td = $('<th>');
        td.addClass('calendar-weekday');
        td.text(week_day);
        tr.append(td);
      });

      wim.forEach(function(ww) {
        var ww_n = ww[0].getWeek();
        var year = that.options.year;
        var tr = $('<tr>');
        tr.calendar_week({year: year, week:ww_n});
        table.append(tr);
        var td = $('<td>');
        td.text(ww_n);
        td.addClass('calendar-ww-title');
        td.addClass('calendar-ww-title-' + that.options.year+'-'+ww_n);
        td.click(function() {that._trigger("wwselected", null, { year: that.options.year, ww: ww_n});});
        tr.append(td);
        ww.forEach(function(d) {
          var td = $('<td>');
          td.click(function() {that._on_click_date($(this))});
          td.calendar_day({date: d, month: that.options.month});
          tr.append(td);
        });
      });

      // XXX untested
      if (this.options.select_day != null) {
        var formatted;
        if ( typeof this.options.select_day == "string" ) {
          formatted = this.options.select_day;
        }
        else {
          formatted = formatDate(this.options.select_day);
        }
        $('calendar-day-'+formatted).trigger('click');
      }
    },
    widget: function() {
      return this.element;
    },

    _setOption: function(key, value) {
      this._super(key, value);
    },

    refresh: function() {
    },

  });


  return $.ui.calendar;
}));

