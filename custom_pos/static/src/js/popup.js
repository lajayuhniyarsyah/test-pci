odoo.define('custom_pos.popup', function (require) {
"use strict";
var PopupWidget = require('point_of_sale.popups')
var gui = require('point_of_sale.gui')
var rpc = require('web.rpc')

var _t  = require('web.core')._t


var InputCardHolderPopup = PopupWidget.extend({
	template: 'InputCardHolderPopup',
	_show_select_credit_type_popup: function(){
		var self = this
		this.gui.show_popup('select-credit-type-popup',{
			'title':_t('Fund Type'),
		})
	},
	__confirm: function(){
		var self = this
		// console.log(['before111 set_card_holder', this.gui.current_screen])
		// point 3a
		// pass to step 4
		var input_val = this.$('div.popup-input-card-holder-popup input.input-card-holder').val()
		if (!input_val.trim()) {
			// if empty
			// point #3a
			self.gui.show_popup('error', {
				'title':_t("Please Input Card Holder Name!"),
				cancel:function(){
					self.gui.close_popup()
				}
			})
		}else{
			var selected_paymentline = this.pos.get_order().selected_paymentline
			if (selected_paymentline) {
				selected_paymentline.set_card_holder(input_val)
				this.gui.current_screen.order_changes()
				this.gui.current_screen.reset_input()
				this.gui.current_screen.render_paymentlines()
			}else{
				var cashregister = null
				for ( var i = 0; i < this.pos.cashregisters.length; i++ ) {
					if ( this.pos.cashregisters[i].journal_id[0] === this.journal_id ){
						cashregister = this.pos.cashregisters[i]
						break;
					}
				}

				this.gui.current_screen.pos.get_order().add_paymentline( cashregister , input_val)
				this.gui.current_screen.order_changes()
				this.gui.current_screen.reset_input()
				this.gui.current_screen.render_paymentlines()
			}
			// point #4b
			self._show_select_credit_type_popup()
			
			
		}
	},
	click_confirm: function(){
		this.__confirm()
	},
	show: function(options) {
		var self = this
		this._super(options)
		this.journal_id = options.journal_id
		if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
			
			var input_elm = this.$('div.popup-input-card-holder-popup input.input-card-holder')
			$('body').off('keypress', this.pos.gui.current_screen.keyboard_handler)
			$('body').off('keydown', this.pos.gui.current_screen.keyboard_keydown_handler)
		}
	},
	close: function(){
		$('body').keypress(this.pos.gui.current_screen.keyboard_handler)
		
		$('body').keydown(this.pos.gui.current_screen.keyboard_keydown_handler)
	},
	click_cancel: function() {
		var selected_paymentline = this.pos.get_order().selected_paymentline

		if (selected_paymentline){
			this.pos.get_order().remove_paymentline(selected_paymentline)
	        this.gui.current_screen.reset_input()
	        this.gui.current_screen.render_paymentlines()
		}
		
		this._super()
	}
})



var CreditTypePopup = PopupWidget.extend({
	template: 'CreditTypePopup',
	events: _.extend({}, PopupWidget.prototype.events, {
		'click .remove-lot': 'remove_lot',
		'keydown': 'add_lot',
		'blur .packlot-line-input': 'lose_input_focus',
		'click .pay-credit':'onclick_pay_credit',
		'click .pay-points':'onclick_pay_points',
		'click .backtocardholder':'onclick_backtocardholder',
	}),

	onclick_pay_credit: function(ev) {
		var selected_paymentline = this.pos.get_order().selected_paymentline
		selected_paymentline.set_pay_credit()
		this.gui.current_screen.order_changes()
		this.gui.current_screen.reset_input()
		this.gui.current_screen.render_paymentlines()
		// this.gui.close_popup()
		this.gui.show_popup('loading-popup',{'title':_t("Please Wait!"), 'body':_t("Please Wait.....")})
	},
	onclick_pay_points: function(ev) {
		var selected_paymentline = this.pos.get_order().selected_paymentline
		selected_paymentline.set_pay_points()
		this.gui.current_screen.order_changes()
		this.gui.current_screen.reset_input()
		this.gui.current_screen.render_paymentlines()
		this.gui.show_popup('loading-popup',{'title':_t("Please Wait!"), 'body':_t("Please Wait.....")})
	},
	onclick_backtocardholder: function(ev) {
		this.gui.show_popup('input-card-holder-popup',{
			'title':_t('Insert Card Holder Name'),
			'body':_t('Please insert card holder name'),
			'journal_id':this.journal_id,
		})
	},
	show: function(options) {
		var self = this
		this._super(options)
	},
	close: function() {
		this._super()
	},
	click_cancel: function() {

		this.pos.get_order().remove_paymentline(this.pos.get_order().selected_paymentline)
        this.gui.current_screen.reset_input()
        this.gui.current_screen.render_paymentlines()
		this._super()
	}
})


// create a new popup widget
var LoadingPopUp = PopupWidget.extend({
	template: 'LoadingPopUp',
	show: function(options){
		var self = this
		this._super(options)
		// point #2a
		// show "INSERT CARD HOLDER POP UP" after few seconds
		// hide current pop up automatically handled by gui object
		setTimeout(function(){
			self.gui.close_popup()
		}, 1500)
	},
})


var WaitingPinpad = PopupWidget.extend({
	template: 'WaitingPinpad',

	_show_insert_card_holder_name_popup: function(){
		var self = this
		self.gui.show_popup('input-card-holder-popup',{
			'title':_t('Insert Card Holder Name'),
			'body':_t('Please insert card holder name'),
			'journal_id':this.journal_id,
			cancel: function(){
				// point #3b
				// close on clicking cancel button on popup
				self.gui.close_popup()
			},
			
		})
	},
	show: function(options){
		this._super(options)
		this.journal_id = options.journal_id
		this.gui.current_screen.journal_id = options.journal_id
		var self = this
		this.gui.play_sound('bell')
		// point #2a
		// show "INSERT CARD HOLDER POP UP" after few seconds
		// hide current pop up automatically handled by gui object
		setTimeout(function(){
			self._show_insert_card_holder_name_popup()
		}, 1000)
	},
})

// register popup into gui
gui.define_popup({name:'select-credit-type-popup', widget: CreditTypePopup})
gui.define_popup({name:'input-card-holder-popup', widget: InputCardHolderPopup})
gui.define_popup({name:'waiting-pinpad', widget: WaitingPinpad})
gui.define_popup({name:'loading-popup', widget: LoadingPopUp})
})