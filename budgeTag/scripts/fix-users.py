
import os, pymongo, sys, datetime, csv
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from collections import Counter

if __name__ == "__main__":
	# open remote database
	

	client 	= pymongo.MongoClient('54.191.187.64', 38716)
	users 	= client.budgeTag.users.find()
	db 		= client.budgeTag
	for user in users:
		if user['type']==2:
			print 'converting...', user['_id']
			db.users.update_one({'_id': user['_id']}, {'$set': {'type': 0, 'prev_type': 3}})

	users 	= client.budgeTag.users.find()
	#test 
	for user in users:
		if user['type']==2:
			print 'found?'