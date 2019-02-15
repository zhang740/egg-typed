'use strict';

module.exports = {
  mockEggTypedLogger() {
    this.mm(this.context, 'eggTypedLogger', {
      info: () => {},
      error: () => {},
    });
  },
};
