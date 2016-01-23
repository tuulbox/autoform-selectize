autoform selectize
=========================

An add-on Meteor package for [aldeed:autoform](https://github.com/aldeed/meteor-autoform). Provides a single custom input type, "universe-select".

This package started off as a fork of [vazco:universe-autoform-select](https://github.com/vazco/meteor-universe-autoform-select) but has evolved a lot. It stays current with any chages there, but is now mostly `es6`, import if you wish `scss`, arrow up and down support with enter to select, custom templates for items in the dropdown with the `itemView` attribute in the `afFieldInput` object, and many bug fixes.

## Prerequisites

The plugin library must be installed separately.

In a Meteor app directory, enter:

```bash
$ meteor add aldeed:autoform
```

## Installation

In a Meteor app directory, enter:

```bash
$ meteor add tuul:autoform-selectize
```

## Usage

Specify "universe-select" for the `type` attribute of any input. This can be done in a number of ways:

In the schema, which will then work with a `quickForm` or `afQuickFields`:

```js
{
  tags: {
    type: [String],
    autoform: {
      type: "universe-select",
      afFieldInput: {
        multiple: true,
        itemView: 'nameOfCustomeItemViewTemplate',
      },
    },
  },
}
```

Or on the `afFieldInput` component or any component that passes along attributes to `afFieldInput`:

```js
{{> afQuickField name="tags" type="universe-select" multiple=true}}

{{> afFormGroup name="tags" type="universe-select" multiple=true itemView='myCustomeDropDownItem'}}

{{> afFieldInput name="tags" type="universe-select" multiple=true}}
```

## Autosave

If you enable autosave option in autoform, then it triggering after blur of universe-select (if multiple).

## Options



<table width="100%">
	<tr>
		<th valign="top" colspan="4" align="left"><a href="#general" name="general">universe-select options</a></th>
	</tr>
	<tr>
		<th valign="top" width="120px" align="left">Option</th>
		<th valign="top" align="left">Description</th>
		<th valign="top" width="60px" align="left">Type</th>
		<th valign="top" width="60px" align="left">Default</th>
	</tr>
	<tr>
		<td valign="top"><code>options</code></td>
		<td valign="top"><i>Required.</i> A function returning either an array of options, or a <code>Mongo.Cursor</code>. The function is re-evaluated automatically using <code>Tracker</code> when its reactive data sources change.</td>
		<td valign="top"><code>function</code></td>
		<td valign="top"><code>undefined</code></td>
	</tr>
	<tr>
		<td valign="top"><code>uniPlaceholder</code></td>
		<td valign="top"><i>Optional.</i> A placeholder option.</td>
		<td valign="top"><code>String</code></td>
		<td valign="top"><code>null</code></td>
	</tr>
	<tr>
    		<td valign="top"><code>disabled</code></td>
    		<td valign="top"><i>Optional.</i></td>
    		<td valign="top"><code>Boolean</code></td>
    		<td valign="top"><code>false</code></td>
    	</tr>
	<tr>
		<td valign="top"><code>multiple</code></td>
		<td valign="top"><i>Optional.</i> </td>
		<td valign="top"><code>Boolean</code></td>
		<td valign="top"><code>false</code></td>
	</tr>
		<tr>
		<td valign="top"><code>itemView</code></td>
		<td valign="top">Custom template for both the dropDown item and then the item in the input. Pass in a name of a template you would like to use.</td>
		<td valign="top"><code>string</code></td>
		<td valign="top"><code>null</code></td>
	</tr>
	<tr>
        <td valign="top"><code>remove_button</code></td>
        <td valign="top"><i>Optional.</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>values_limit</code></td>
        <td valign="top"><i>Optional.</i> </td>
        <td valign="top"><code>Number</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>create</code></td>
        <td valign="top"><i>Optional. Allows the user to create a new items that aren't in the list of options.</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>createOnBlur</code></td>
        <td valign="top"><i>Optional. If true, when user exits the field (clicks outside of input or presses ESC) new option is created and selected (if `create`-option is enabled).</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>createSlug</code></td>
        <td valign="top"><i>Optional. After creating new label, converts value into a slug.</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>createMethod</code></td>
        <td valign="top"><i>Optional. Name of method to call after create new item.</i> </td>
        <td valign="top"><code>function (label, value)</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsMethod</code></td>
        <td valign="top"><i>Optional. Name of method to get more items. Method should return array of options.</i> </td>
        <td valign="top"><code>function (query)</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsMethodParams</code></td>
        <td valign="top"><i>Optional. Additional params for optionsMethod.</i> </td>
        <td valign="top"><code>Object</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
</table>


## Example optionsMethod:

```js
Meteor.methods({
    getOptions: function (options) {
        this.unblock();
        var searchText = options.searchText;
        var values = options.values;
        
        if (searchText) {
            return OptionsCollection.find({label: {$regex: searchText}}, {limit: 5}).fetch();
        } else if (values.length) {
            return OptionsCollection.find({value: {$in: values}}).fetch();
        }
        return OptionsCollection.find({}, {limit: 5}).fetch();
    }
});
```
