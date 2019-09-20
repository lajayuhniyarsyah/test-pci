odoo.define('custom_pos.popup', function (require) {
"use strict";
var PopupWidget = require('point_of_sale.popups')
var gui = require('point_of_sale.gui')
var rpc = require('web.rpc')

var _t  = require('web.core')._t


var InputCardHolderPopup = PopupWidget.extend({
	template: 'InputCardHolderPopup',
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
	}
})


// create a new popup widget
var WaitingPinpad = PopupWidget.extend({
	template: 'WaitingPinpad',
	_show_insert_card_holder_name_popup: function(){
		console.log("Logging journal id on waiting pinpad")
		console.log(this.journal_id)
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
			confirm: function(){
				// console.log(['before111 set_card_holder', this.gui.current_screen])
				// point 3a
				// pass to step 4
				var input_val = this.$('div.popup-input-card-holder-popup input.input-card-holder').val()

				console.log(this.$('div.popup-input-card-holder-popup input.input-card-holder'))
				console.log(this.$('div.popup-input-card-holder-popup input.input-card-holder').val())
				if (!input_val.trim()) {
					// if empty
					// point #3a
					self.gui.show_popup('error', {
						'title':_t("Please Input Card Holder Name!"),
						cancel:function(){
							self._show_insert_card_holder_name_popup()
						}
					})
				}else{

					var cashregister = null
					console.log('satu')
					console.log(this.pos)
					for ( var i = 0; i < this.pos.cashregisters.length; i++ ) {
						if ( this.pos.cashregisters[i].journal_id[0] === this.journal_id ){
							cashregister = this.pos.cashregisters[i]
							break;
						}
					}

					this.gui.current_screen.pos.get_order().add_paymentline( cashregister , input_val);
			        this.gui.current_screen.reset_input();
			        this.gui.current_screen.render_paymentlines();
					
					
				}
			},
		})
	},
	show: function(options){
		this._super(options)
		this.journal_id = options.journal_id
		var self = this
		this.gui.play_sound('bell')
		// point #2a
		// show "INSERT CARD HOLDER POP UP" after few seconds
		// hide current pop up automatically handled by gui object
		setTimeout(function(){
			self._show_insert_card_holder_name_popup()
		}, 1000);
	},
})

// register popup into gui
gui.define_popup({name:'input-card-holder-popup', widget: InputCardHolderPopup})
gui.define_popup({name:'waiting-pinpad', widget: WaitingPinpad})
})