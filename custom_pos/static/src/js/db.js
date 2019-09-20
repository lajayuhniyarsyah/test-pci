odoo.define('custom_pos.DB', function (require) {
"use strict";

var PosDB = require('point_of_sale.DB')

CustomPosDB = PosDB.include({
	init: function(options){
		this._super(options)
		if (options.card_holder) {
			this.set_card_holder(options.card_holder)
		}
	},
	set_card_holder: function(value) {
		this.card_holder = value
	},
	get_card_holder: function() {
		return this.card_holder
	}
})

})