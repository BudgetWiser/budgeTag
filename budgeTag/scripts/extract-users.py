
import os, pymongo, sys, datetime, csv
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from collections import Counter

if __name__ == "__main__":
	# open remote database
	

	client = pymongo.MongoClient('54.191.187.64', 38716)
	users = client.budgeTag.users.find()
	
	with open('users.csv', 'wb') as csvfile:
		userCSV = csv.writer(csvfile)

		for user in users:
			if len(user['_checked'])==0:
				userCSV.writerow([user['username'], user['type'], "-", "-"])
			else:
				for check in user['_checked']:
					userCSV.writerow([user['username'], user['type'], check['issue'].encode("utf-8"), check['service'].encode("utf-8")])
