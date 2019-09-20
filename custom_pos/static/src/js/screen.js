odoo.define('custom_pos.screens', function (require) {
"use strict";

var PaymentScreenWidget = require('point_of_sale.screens').PaymentScreenWidget;


var CustomPaymentScreenWidget = PaymentScreenWidget.include({
	set_card_holder: function(value){
		this.card_holder = value
	},
	click_paymentmethods: function(id){
		var self = this

		if (id==10){
			// point #2
			// show popup waiting pinpad feedback
			this.gui.show_popup('waiting-pinpad',{
				'title': _t('Waiting Pinpad'),
				'body': _t('Waiting pinpad feedback...'),
				'journal_id':id,
				cancel: function () {
					// point #2b
					self.gui.close_popup();
				},
			});
		}else{
			this._super(id)
		}
	},
	card_holder_input: function(value) {
		var order = this.pos.get_order();
	    order.selected_paymentline.set_screen_data('card_holder',value)
	    this.order_changes();
	    // this.render_paymentlines();
	    // this.$('.paymentline.selected .edit').text(this.format_currency_no_symbol(amount));
        
    },

})

return {
	CustomPaymentScreenWidget:CustomPaymentScreenWidget
}

})