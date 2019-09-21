odoo.define('custom_pos.models', function (require) {
"use strict";


var core = require('web.core');
var _t = core._t;

var models = require('point_of_sale.models')
var order_super = models.Order.prototype;
var paymentline_super = models.Paymentline.prototype;


models.Paymentline = models.Paymentline.extend({
	initialize: function(attributes, options) {
		paymentline_super.initialize.apply(this, arguments);
		this.pay_credit = false
		this.pay_points = false
		this.card_holder = ""
		if (options.card_holder){
			this.set_card_holder(options.card_holder)
		}
	},
	export_as_JSON: function(){
		var res = paymentline_super.export_as_JSON.apply(this, arguments)
		res.card_holder = this.card_holder
		res.pay_credit = this.pay_credit
		res.pay_points = this.pay_points
        return res
    },
    set_pay_points: function(){
    	this.pay_credit = false;
    	this.pay_points = true;
    	this.trigger('change',this);
    },
    get_pay_points: function(){
    	return this.pay_points
    },
    set_pay_credit: function(){
    	this.pay_points = false;
    	this.pay_credit = true;
    	this.trigger('change',this);
    },
    get_pay_credit: function(){
    	return this.pay_credit
    },
    set_card_holder: function(value) {
    	this.card_holder = value.trim()
    	this.trigger('change',this);
    }
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
        var newPaymentline = new models.Paymentline({},{order: this, cashregister:cashregister, pos: this.pos, card_holder:card_holder});
        if(cashregister.journal.type !== 'cash' || this.pos.config.iface_precompute_cash){
            newPaymentline.set_amount( this.get_due() );
        }
        this.paymentlines.add(newPaymentline);
        this.select_paymentline(newPaymentline);
    },
});

})