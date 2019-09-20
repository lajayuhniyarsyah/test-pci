odoo.define('custom_pos.models', function (require) {
"use strict";


var core = require('web.core');
var _t = core._t;

var models = require('point_of_sale.models')
var order_super = models.Order.prototype;
var paymentline_super = models.Paymentline.prototype;


models.Paymentline = models.Paymentline.extend({
	// init_from_JSON: function(json) {
	// 	console.log("Called from extended paymentline ")
	// 	paymentline_super.init_from_JSON.apply(this, arguments);	
	// 	this.card_holder = json.card_holder
	// }
	initialize: function(attributes, options) {
		paymentline_super.initialize.apply(this, arguments);
		if (options.card_holder){
			this.card_holder = options.card_holder
		}
	},
	export_as_JSON: function(){
		var res = paymentline_super.export_as_JSON.apply(this, arguments)
		res.card_holder = this.card_holder
		console.log('retuen export json')
		console.log(res)
        return res
    },
})


models.Order = models.Order.extend({
	init_from_JSON: function (json) {
		order_super.init_from_JSON.apply(this, arguments);	
	},
	export_as_JSON: function () {
		var res = order_super.export_as_JSON.apply(this, arguments);
		return res;
	},
	add_paymentline: function(cashregister, card_holder="") {
        this.assert_editable();
        console.log("AAAAAAAAAAAAAAAAAAAAhahahahahaha")
        console.log("inserting card holder" + card_holder)
        var newPaymentline = new models.Paymentline({},{order: this, cashregister:cashregister, pos: this.pos, card_holder:card_holder});
        
        console.log(newPaymentline)
        if(cashregister.journal.type !== 'cash' || this.pos.config.iface_precompute_cash){
            newPaymentline.set_amount( this.get_due() );
        }
        this.paymentlines.add(newPaymentline);
        this.select_paymentline(newPaymentline);
    },
});

})