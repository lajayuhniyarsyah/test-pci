{
    'name': 'Custom POS',
    'summary': """
        Custom POS
        La Jayuhni Yarsyah / lajayuhni@gmail.com""",
    'version': '0.0.1',
    'category': 'pos',
    "author": "La Jayuhni Yarsyah",
    'description': """
        Custom ODOO POS Module as requirement for hiring test.
    """,
    'depends': [
        'point_of_sale',
    ],
    'data': [
    	'views/assets.xml',

        'data/pos_config.xml',
    	'data/account_journal.xml',
    ],
    'qweb':[
    	'static/src/xml/custom_pos.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True    
}