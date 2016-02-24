'use strict';

AutoForm.addInputType('universe-select', {
  template: 'afUniverseSelect',
  valueIsArray: true,
  valueOut() {
    return this.val();
  },
  contextAdjust(context) {
    // build items list

    context.items = _.map(context.selectOptions, function (opt) {
      return {
        label: opt.label,
        value: opt.value,
        selected: _.contains(context.value, opt.value)
      };
    });

    // remove_button option
    if (context.atts.remove_button === false) {
      context.atts.remove_button = '';
    } else {
      context.atts.remove_button = 'plugin-remove_button';
    }

    // multiple option
    if (context.atts.multiple) {
      context.atts.multipleClass = 'multi';
    } else {
      context.atts.multiple = undefined;
      context.atts.multipleClass = 'single';
      context.atts.remove_button = '';
    }

    if (context.atts.createSlug !== false) {
      context.atts.createSlug = true;
    }

    //autosave option
    if (AutoForm && typeof AutoForm.getCurrentDataForForm === 'function') {
      context.atts.autosave = AutoForm.getCurrentDataForForm().autosave || false;
      context.atts.placeholder = AutoForm.getCurrentDataForForm().placeholder || context.atts.uniPlaceholder || null;
      context.atts.uniDisabled = !!AutoForm.getCurrentDataForForm().disabled || false;
    }

    return context;
  }
});

Template.afUniverseSelect.onCreated(() => {
  let universeSelect = Template.instance().universeSelect = {};
  universeSelect.items = new ReactiveVar();
  universeSelect.values = new ReactiveVar();
  universeSelect.reactive = new ReactiveVar(true);
  universeSelect.loading = new ReactiveVar(false);
  universeSelect.hoveredItem = new ReactiveVar(null);
  universeSelect.value = new ReactiveVar('');
  universeSelect.dropDownMaxHeight = new ReactiveVar();


  // Define all the functions this thing uses:

  universeSelect.checkDisabled = (template) => {
   if (template.data.atts.uniDisabled) {
      throw new Meteor.Error('This field is disabled');
    }
  };


  universeSelect.saveValues = (template, values) => {
    var items = template.universeSelect.items.get();

    if (!_.isArray(values)) {
      values = [values];
    }

    _.each(items, (item, key) => {
      if (_.indexOf(values, item.value.toString()) !== -1) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });

    template.universeSelect.items.set(items);
  };

  // from selectize utils https://github.com/brianreavis/selectize.js/blob/master/src/utils.js

  universeSelect.measureString = (str, $parent) => {
    // FIXME there is a bug with measuring the string and setting the right width. Measures short.

    if (!str) {
      return 0;
    }

    let $test = $('<test>').css({
      position: 'absolute',
      top: -99999,
      left: -99999,
      width: 'auto',
      padding: 0,
      whiteSpace: 'pre'
    }).text(str).appendTo('body');

    let properties = [
      'letterSpacing',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textTransform'
    ];

    let styles = {};
    let i;
    let n;

    for (i = 0, n = properties.length; i < n; i++) {
      styles[properties[i]] = $parent.css(properties[i]);
    }

    $test.css(styles);

    let width = $test.width();

    $test.remove();

    return width;
  };

  universeSelect.setVisibleByValue = (value, template) => {
    var items = template.universeSelect.items.get();

    _.each(items, function (item) {
      if (typeof item.label === 'object' || item.label.search(new RegExp(value, 'i')) !== -1) {
        item.visible = true;
      } else {
        item.visible = false;
      }
    });

    template.universeSelect.items.set(items);
  };

  universeSelect.getOptionsFromMethod = (searchText, values, template) => {
    var optionsMethod = template.data.atts.optionsMethod;
    var optionsMethodParams = template.data.atts.optionsMethodParams;
    var searchVal;

    if (!optionsMethod) {
      return false;
    }

    searchVal = {
      searchText: searchText,
      values: values || [],
      params: optionsMethodParams || null
    };

    template.universeSelect.loading.set(true);

    Meteor.call(optionsMethod, searchVal, function (err, res) {
      var items = template.universeSelect.items.get() || [];
      var items_selected = [];

      _.each(items, function (item) {
        if(values && _.indexOf(values, item.value) !== -1){
          item.selected = true;
          items_selected.push(item);
        } else if(values === null && item.selected){
          items_selected.push(item);
        }
      });

      _.each(res, function (obj) {
        if (_.find(items_selected, function (item) {
            return item.value === obj.value;
          })) {
          return;
        }

        items_selected.push(_.extend({}, obj, {
          selected: _.indexOf(values, obj.value) !== -1,
          visible: true
        }));
      });

      template.universeSelect.items.set(items_selected);
      template.universeSelect.loading.set(false);
      template.universeSelect.setVisibleByValue(searchText, template);
    });
  };


  universeSelect.scrollElementInView = (element, parent, direction) => {
    const parentRect = parent[0].getBoundingClientRect();

    switch(direction) {
      case 'up':
      if (element.prev()) {
        let prevElement = element.prev().length === 1 ? element.prev() : element;

        const prevElementRect = prevElement[0].getBoundingClientRect();
        const prevElementOuterHeight = prevElement.outerHeight(true);

        if (prevElementRect.top < parentRect.top) {
          parent.scrollTop((prevElementRect.bottom - parentRect.top) - prevElementOuterHeight + parent.scrollTop());
        }
      }
      break;

      case 'down':
      if (element.next()) {
        let nextElement = element.next().length === 1 ? element.next() : element;

        const nextElementRect = nextElement[0].getBoundingClientRect();
        const nextElementOuterHeight = nextElement.outerHeight(true);

        if (nextElementRect.bottom > parentRect.bottom) {
          parent.scrollTop((nextElementRect.top - parentRect.bottom) + nextElementOuterHeight + parent.scrollTop());
        }
      }
      break;
    }
  };

  universeSelect.openDropDown = (template) => {
    $(template.find('.js-selectize-dropdown')).stop(true, true).addClass('is-active');

    template.universeSelect.dropDownMaxHeight.set(window.innerHeight - template.$('.selectize-input')[0].getBoundingClientRect().bottom);
  };

  universeSelect.closeDropDown = (template) => {
    template.$('.js-selectize-dropdown').stop(true, true).removeClass('is-active');
  }
});

Template.afUniverseSelect.onRendered(() => {
  const template = Template.instance();
  let prevVal;
  let optionsMethod = template.data.atts.optionsMethod;

  if (optionsMethod) {
    template.autorun(() => {
      var data = Template.currentData();

      template.universeSelect.getOptionsFromMethod(null, data.value, template);
    });
  } else {
    template.autorun(() => {
      var data = Template.currentData();

      _.each(data.items, (item) => {
        item.visible = true;
      });

      if (template.universeSelect.reactive.get()) {
        template.universeSelect.items.set(data.items);
      }
    });
  }

  template.autorun(() => {
    let items = template.universeSelect.items.get();
    let values = [];
    let values_limit = template.data.atts.values_limit;

    _.each(items, (item) => {
      if (item.selected) {
        values.push(item.value);
      }
    });

    if (values_limit !== undefined && values.length > values_limit) {
      let values_old = template.universeSelect.values.get();
      _.each(items, (item) => {
        if (!_.contains(values_old, item.value)) {
          item.selected = false;
        }
      });
      template.universeSelect.items.set(items);
      return;
    }

    template.universeSelect.values.set(values);
  });

  template.autorun(() => {
    let values = template.universeSelect.values.get();
    let $select = template.$('select');

    if (!_.isEqual($select.val(), values)) {
      Meteor.setTimeout(() => {
        $select.val(values);

        if ($select.val() && template.data.atts.submit) {
          $(template.data.atts.submit).submit();
        }

      }, 0);
    }

    prevVal = values;
  });

  if (AutoForm && typeof AutoForm.getCurrentDataForForm === 'function') {
    let formId = AutoForm.getCurrentDataForForm().id;
    $('#' + formId).bind('reset', () => {
      template.universeSelect.saveValues(template, []);
    });
  }
});


Template.afUniverseSelect.helpers({
  atts: () => _.omit(_.clone(Template.instance().data.atts), ['optionsMethodParams', 'class']),
  attsClass: () => Template.instance().data.atts.class,
  dropDownMaxHeight: () => {
    let dropDownMaxHeight = Template.instance().universeSelect.dropDownMaxHeight.get()

    if (dropDownMaxHeight < 200) {
      return `${dropDownMaxHeight - 4}px`;
    }
  },
  optionAtts() {

    return {value: this.value}
  },
  getItems: () => Template.instance().universeSelect.items.get(),
  getItemsSelected: () => Template.instance().universeSelect.items.get() ? Template.instance().universeSelect.items.get().filter(item => item.selected) : [],
  isLoading: () => Template.instance().universeSelect.loading.get(),
  getPlaceholder: () => Template.instance().data.atts.placeholder,
  isDisabled: () => Template.instance().data.atts.uniDisabled,
  getLabelView: () => Template.instance().data.atts.itemView ? Template.instance().data.atts.itemView : 'afUniverseSelect_label',
  getItemsUnselected: () => {
    let items = [];

    _.each(Template.instance().universeSelect.items.get(), (item) => {
      if (!item.selected && item.visible) {
        items.push(item);
      }
    });

    if (items.length >= 1) {
      items[0].initial = 'is-focused';
    } else if (Template.instance().universeSelect.value.get().length >= 1) {
      return [{content: `no result for '${Template.instance().universeSelect.value.get()}'`}]
    } else {
      return [{content: 'begin typing to search...'}]
    }

    return items;
  },
});


Template.afUniverseSelect.events({
  'click .remove' (event, template) {
    event.preventDefault();
    template.universeSelect.checkDisabled(template);

    var $el = $(event.target);
    var val = $el.parent().attr('data-value');
    var values = template.universeSelect.values.get();

    values = _.without(values, val);

    template.universeSelect.saveValues(template, values);
  },
  'click [data-action=selectizeDropDownItem]' (event, template) {
    event.preventDefault();
    event.stopPropagation();
    template.universeSelect.checkDisabled(template);

    var $el = $(event.currentTarget);
    var val = $el.attr('data-value');
    var values = template.universeSelect.values.get();

    if (template.data.atts.multiple) {
      values = _.union(values, val);
    } else {
      values = val;
    }

    template.universeSelect.saveValues(template, values);

    template.$('input').val('');
    template.universeSelect.setVisibleByValue('', template);

    if (template.data.atts.multiple) {
      $(template.find('input')).focus();
    }


    template.universeSelect.closeDropDown(template);
  },
  'click .selectize-input, click .selectize-label' (event, template) {
    template.universeSelect.checkDisabled(template);

    var $input = $(template.find('input'));
    $input.focus();

    template.universeSelect.getOptionsFromMethod($input.val(), null, template);
  },
  'keydown input' (event, template) {
    template.universeSelect.openDropDown(template);

    if (event.keyCode === 38 || event.keyCode === 40) {
      event.preventDefault();
    }

    template.universeSelect.checkDisabled(template);

    var $el = $(event.target);
    var values = template.universeSelect.values.get();
    var width = template.universeSelect.measureString($el.val(), $el) + 10;
    var $input = $(template.find('input'));
    var $unselectedItems = $(template.findAll('.selectize-dropdown-content > div:not(.create)'));
    var $createItem = $(template.find('.selectize-dropdown-content > div.create'));
    var activeElement;

    if (template.universeSelect.hoveredItem.get()) {
      activeElement = template.$(`[data-value="${template.universeSelect.hoveredItem.get()}"]`);
      activeElement.addClass('not-hovered');
      template.universeSelect.hoveredItem.set(null);
    } else if (template.$('.is-focused').length > 0) {
      activeElement = template.$('.is-focused');
    } else {
      activeElement = template.$('[data-selectable]:first');
      activeElement.addClass('is-focused')
    }

    $el.width(width);

    switch (event.keyCode) {
      case 8: // backspace
        if ($el.val() === '') {
          values.pop();
          template.universeSelect.saveValues(template, values);
        }
        break;

      case 27: // escape
        $input.blur();
        break;

      case 38: // up arrow
        const prevElement = activeElement.prev();

        if (prevElement.length === 1) {
          activeElement.removeClass('is-focused');
          prevElement.addClass('is-focused');
          template.universeSelect.scrollElementInView(prevElement, template.$('.selectize-dropdown-content'), 'up');
        } else {
          activeElement.addClass('is-focused');
        }

        activeElement = prevElement;
        break;

      case 40: // down arrow
        const nextElement = activeElement.next();

        if (nextElement.length === 1) {
          activeElement.removeClass('is-focused');
          nextElement.addClass('is-focused');
          template.universeSelect.scrollElementInView(nextElement, template.$('.selectize-dropdown-content'), 'down');
        } else {
          activeElement.addClass('is-focused');
        }

        activeElement = nextElement;
        break;

      case 13: // enter
        event.preventDefault();

        if ($input.val() === '') {
          break;
        } else if (activeElement.length >= 1) {
          activeElement.trigger('click');
          break;
        }

        // not sure if it will hit this ever.

        if ($unselectedItems.length === 1) {
          $unselectedItems.first().trigger('click');
          $input.val('');
        } else if (template.data.atts.create) {
          $createItem.trigger('click');
          $input.val('');
        }
        break;
    }
  },
  'keyup input' (event, template) {
    template.universeSelect.checkDisabled(template);

    var $el = $(event.target);
    var value = $el.val();

    template.universeSelect.value.set(value);


    if (value) {
      $(template.find('.create')).show();
      $(template.find('.create strong')).text(value);
    } else {
      $(template.find('.create')).hide();
    }

    template.universeSelect.setVisibleByValue(value, template);

    template.universeSelect.getOptionsFromMethod(value, null, template);
  },
  'focus input' (event, template) {
    template.universeSelect.checkDisabled(template);

    template.universeSelect.openDropDown(template);
    template.$('.selectize-input').addClass('focus input-active dropdown-active');
  },
  'change input' (event, template) {
    template.universeSelect.checkDisabled(template);

    // prevent non-autoform fields changes from submitting the form when autosave is enabled
    event.preventDefault();
    event.stopPropagation();
  },
  'blur input' (event, template) {
    template.universeSelect.checkDisabled(template);

    let $select = template.$('select');
    let values = template.universeSelect.values.get();
    $select.val(values);
    $select.change(); //save value on blur

    template.universeSelect.closeDropDown(template);
    template.$('.selectize-input').removeClass('focus input-active dropdown-active');
  },
  'click .create' (event, template) {
    template.universeSelect.checkDisabled(template);

    var $input = template.$('input');
    var items = template.universeSelect.items.get();
    var values = template.universeSelect.values.get();
    var label = $input.val();
    var value = label;

    if (template.data.atts.createSlug) {
      value = getSlug(value);
    }

    template.universeSelect.reactive.set(false);

    var _saveCreatedItem = function () {
      if (template.data.atts.multiple) {
        values = _.union(values, value);
      } else {
        values = value;
      }

      template.universeSelect.saveValues(template, values);
    };

    if (_.indexOf(values, value) === -1) {
      items.push({
        label: label,
        value: value,
        selected: true,
        visible: false
      });

      template.universeSelect.items.set(items);

      if (template.data.atts.createMethod) {
        Meteor.call(template.data.atts.createMethod, label, value, function () {
          _saveCreatedItem();
        });
      } else {
        _saveCreatedItem();
      }
    }

    $input.val('');
    $(template.find('.create')).hide();
  },
  'mouseenter [data-selectable]' (event, template) {
    template.universeSelect.hoveredItem.set(template.$(event.target).attr('data-value'));
  },
  'mousemove .selectize-dropdown-content' (event, template) {
    template.$('.is-focused').removeClass('is-focused');
    template.$('.not-hovered').removeClass('not-hovered');
  },
});
