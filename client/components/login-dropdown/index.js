module.exports = lDropdown;
function lDropdown() {}
lDropdown.prototype.name = 'login-dropdown';
lDropdown.prototype.view = __dirname;

lDropdown.prototype.create = function(model, dom) {
  // Close on click outside of the dropdown
  var dropdown = this;
  dom.on('click', function(e) {
    if (dropdown.toggleButton.contains(e.target)) return;
    if (dropdown.menu.contains(e.target)) return;
    model.set('open', false);
  });
};

lDropdown.prototype.toggle = function() {
  this.model.set('open', !this.model.get('open'));
};

lDropdown.prototype.select = function(option) {
  this.model.set('value', optionValue(option));
  this.model.set('open', false);
};

lDropdown.prototype.label = function(value) {
  var options = this.model.get('options') || [];
  for (var i = 0, len = options.length; i < len; i++) {
    var option = options[i];
    if (value === optionValue(option)) {
      return option.content;
    }
  }
  return this.model.get('prompt') || 'Select';
};

function optionValue(option) {
  return (option.hasOwnProperty('value')) ? option.value : option.content;
}
