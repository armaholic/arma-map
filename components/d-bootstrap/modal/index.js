module.exports = Modal;
function Modal() {}
Modal.prototype.name = 'modal';
Modal.prototype.view = __dirname;

Modal.prototype.create = function (model, dom) {
  var modal = this;
  dom.on('keydown', function (e) {
    if (!model.get('show')) return;
    if (e.keyCode === 27) {  // Escape
      modal.hide('escape');
    }
  });
};

Modal.prototype.show = function() {
  var model = this.model;
  this.emitDelayable('show', function() {
    model.set('show', true);
    setTimeout(function() { 
      model.set('faded', true);
    }, 0);
    document.body.classList.add('modal-open');
  });
};

Modal.prototype.hide = function(action) {
  var cancelled = this.emitCancellable('hide', action);
  if (cancelled) return;
  var model = this.model;
  model.set('faded', false);
  setTimeout(function() {
    model.set('show', false);
  }, 300);
  document.body.classList.remove('modal-open');
};

Modal.prototype.send = function(action) {
  var cancelled = this.emitCancellable('send', action);
  if (cancelled) return;
  var model = this.model;
  model.set('faded', false);
  setTimeout(function() {
    model.set('show', false);
  }, 300);
  document.body.classList.remove('modal-open');
};
