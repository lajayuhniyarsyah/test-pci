# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError,ValidationError

import logging
_logger = logging.getLogger(__name__)


class PosConfig(models.Model):
	_inherit = 'pos.config'
	
	@api.model
	def add_credit_card_payment_method(self):
		pos_config = self.env.ref('point_of_sale.pos_config_main')
		pos_config.write({'journal_ids':[(4,self.env.ref('custom_pos.journal_credit_card').id)]})

	@api.model
	def use_iface_vkeyboard(self):
		pos_config = self.env.ref('point_of_sale.pos_config_main')
		pos_config.write({'iface_vkeyboard':True})

	@api.model
	def use_iface_precompute_cash(self):
		pos_config = self.env.ref('point_of_sale.pos_config_main')
		pos_config.write({'iface_precompute_cash':True})


class AccountBankStatementLine(models.Model):
	_inherit = 'account.bank.statement.line'

	card_holder = fields.Char(string="Card Holder Name")
	pay_points = fields.Boolean('Payment with Point', default=False)
	pay_credit = fields.Boolean('Payment with Credit', default=False)


class PosOrder(models.Model):
	_inherit = 'pos.order'


	def _prepare_bank_statement_line_payment_values(self, data):
		res = super(PosOrder, self)._prepare_bank_statement_line_payment_values(data)
		card_holder = data.get('card_holder')
		if card_holder:
			res.update({
				'card_holder':card_holder,
				})


		pay_points = data.get('pay_points')
		pay_credit = data.get('pay_credit')
		if pay_points or pay_credit:
			res.update({
				'pay_points': pay_points,
				'pay_credit': pay_credit,
				})

		return res


	def _payment_fields(self, ui_paymentline):
		res = super(PosOrder, self)._payment_fields(ui_paymentline)
		res.update({
			'card_holder':ui_paymentline['card_holder'],
			'pay_points':ui_paymentline['pay_points'],
			'pay_credit':ui_paymentline['pay_credit'],
			})
		return res