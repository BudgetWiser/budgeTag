
import os, pymongo, sys, datetime, csv, itertools
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from collections import Counter

if __name__ == "__main__":
	# open remote database
	userList = {}
	with open('survey.csv', 'rU') as csvfile:
		surveyReader = csv.reader(csvfile)
		for row in surveyReader:
			userList[row[0]] = True

	client = pymongo.MongoClient('54.191.187.64', 38716)
	users = client.budgeTag.users
	issues = client.budgeTag.issues

	issueNames = {}

	print 'processing issues....'
	with open('issue-stats.csv', 'wb') as csvfile:
		issueCSV = csv.writer(csvfile)
		rows 	= []
		row 	= ['issue', 'issue-sum', 'service', 'service-sum', 'agree', 'disagree', 'noidea', 'category1', 'category2', 'category3', 'category4']
		row 	=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
		rows.append(row)
		for issue in issues.find():	
			issueNames[issue['keyword']] = True

			for service in issue['services']:
				row = [issue['keyword'], issue['sum'], service['name'], service['sum'], service['agree'], service['disagree'], service['noidea']]
				row = row + service['categories']
				row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
				rows.append(row)

		issueCSV.writerows(rows)

	print 'processing users....'
	with open('user-stats.csv', 'wb') as csvfile:
		userCSV = csv.writer(csvfile)

		rows = []
		row = ['username', 'type', 'totalTags'] + issueNames.keys()
		row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
		rows.append(row)
		for user in users.find():
			if userList.has_key(user['username'])==False:
				print '- ', user['username'], ' is filtered'
				continue
			row = [user['username'], user['type'], len(user['_checked'])]

			#group by issues
			issue = {}
			sortedIssues = sorted(user['_checked'], key=lambda x: x["issue"])
			for k, g in itertools.groupby(sortedIssues, key=lambda x: x["issue"]):
				issue[k] = len(list(g))

			for key in issueNames.keys():
				if issue.has_key(key):
					row.append(issue[key])
				else:
					row.append(0)
			row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
			rows.append(row)
			# print row
			# userCSV.writerow(row)
		

		userCSV.writerows(rows)
			