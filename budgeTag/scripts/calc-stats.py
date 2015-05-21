
import os, pymongo, sys, datetime, csv, itertools
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from scipy import stats
from collections import Counter

if __name__ == "__main__":
	# open remote database


	client = pymongo.MongoClient('54.191.187.64', 38716)
	users = client.budgeTag.users
	issues = client.budgeTag.issues
	services = client.budgeTag.services

	userList = {}
	with open('survey.csv', 'rU') as csvfile:
		surveyReader = csv.reader(csvfile)
		for row in surveyReader:
			userList[row[0]] = True

	# issueNames = {}

	# print 'processing issues....'
	# with open('issue-stats.csv', 'wb') as csvfile:
	# 	issueCSV = csv.writer(csvfile)
	# 	rows 	= []
	# 	row 	= ['issue', 'issue-sum', 'service', 'service-sum', 'agree', 'disagree', 'noidea', 'category1', 'category2', 'category3', 'category4']
	# 	row 	=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
	# 	rows.append(row)
	# 	for issue in issues.find():	
	# 		issueNames[issue['keyword']] = True

	# 		for service in issue['services']:
	# 			row = [issue['keyword'], issue['sum'], service['name'], service['sum'], service['agree'], service['disagree'], service['noidea']]
	# 			row = row + service['categories']
	# 			row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
	# 			rows.append(row)

	# 	issueCSV.writerows(rows)

	# print 'processing users....'
	# with open('user-stats.csv', 'wb') as csvfile:
	# 	userCSV = csv.writer(csvfile)

	# 	rows = []
	# 	row = ['username', 'type', 'totalTags'] + issueNames.keys()
	# 	row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
	# 	rows.append(row)
	# 	for user in users.find():
	# 		if userList.has_key(user['username'])==False:
	# 			print '- ', user['username'], ' is filtered'
	# 			continue
	# 		row = [user['username'], user['type'], len(user['_checked'])]

	# 		#group by issues
	# 		issue = {}
	# 		sortedIssues = sorted(user['_checked'], key=lambda x: x["issue"])
	# 		for k, g in itertools.groupby(sortedIssues, key=lambda x: x["issue"]):
	# 			issue[k] = len(list(g))

	# 		for key in issueNames.keys():
	# 			if issue.has_key(key):
	# 				row.append(issue[key])
	# 			else:
	# 				row.append(0)
	# 		row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
	# 		rows.append(row)
	# 		# print row
	# 		# userCSV.writerow(row)
	# 	userCSV.writerows(rows)

	# print 'processing rankings....'
	# with open('user-rankings.csv', 'wb') as csvfile:
	# 	userCSV = csv.writer(csvfile)

	# 	rows = []
	# 	for user in users.find():
	# 		row = [user['username'], user['type'], len(user['_checked'])]
	# 		rows.append(row)
	# 		# print row
	# 		# userCSV.writerow(row)		
	# 	sortedRows = sorted(rows, key=lambda x: x[2])
	# 	sortedRows.insert(0,  ['username', 'type', 'totalTags'])
	# 	userCSV.writerows(sortedRows)

	expertSols = {}
	availableIssues = {}
	with open('expert-solutions.csv', 'rU') as csvfile:
		solreader = csv.reader(csvfile)
		header = solreader.next()
		for row in solreader:
			key = row[2]+row[3]+row[4]+row[5]+row[6]+header[7]
			expertSols[unicode(key, 'utf-8').replace(" ", "")] = int(row[7])
			key = row[2]+row[3]+row[4]+row[5]+row[6]+header[8]
			expertSols[unicode(key, 'utf-8').replace(" ", "")] = int(row[8])
			key = row[2]+row[3]+row[4]+row[5]+row[6]+header[9]
			expertSols[unicode(key, 'utf-8').replace(" ", "")] = int(row[9])
			key = row[2]+row[3]+row[4]+row[5]+row[6]+header[10]
			expertSols[unicode(key, 'utf-8').replace(" ", "")] = int(row[10])

			availableIssues[header[7]]=True
			availableIssues[header[8]]=True
			availableIssues[header[9]]=True
			availableIssues[header[10]]=True

	print 'processing accuracies....'
	# print availableIssues
	votes = {}
	issueMap = {}
	userType = 3 # 0 : random, 1: td-tdf 2: rand + td-tdf 3: all
	for issue in issues.find():
		votes[issue['_id']] = {}
		issueMap[issue['_id']] = issue

	serviceMap = {}
	for service in services.find():
		serviceMap[service['_id']] = service
	# print expertSols
	for user in users.find():
		# if userList.has_key(user['username'])==False: # filter users
		# 	continue

		checked = {} # for duplicate votes

		for vote in user['checked']:
			if checked.has_key(str(vote['issue']) + str(vote['service'])): #duplicate vote found
				continue
			if userType!=3 and user['type']!=userType:
				continue
			checked[str(vote['issue']) + str(vote['service'])] = True
			if votes[vote['issue']].has_key(vote['service'])==False:
				votes[vote['issue']][vote['service']] = {'agree':0, 'noidea':0, 'disagree':0}
			if vote['type']==1:
				votes[vote['issue']][vote['service']]['agree'] += 1
			elif vote['type']==0:
				votes[vote['issue']][vote['service']]['noidea'] += 1
			elif vote['type']==-1:
				votes[vote['issue']][vote['service']]['disagree'] += 1

	
	with open('crowd-solutions.csv', 'wb') as csvfile:
		userCSV = csv.writer(csvfile)
		rows = []
		row = ['usertype', 'category1', 'category2', 'category3', 'category4', 'service', 'issue', 'agree', 'disagree', 'noidea', 'expSol'] 
		row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
		rows.append(row)

		with open('crowd-stats.csv', 'wb') as csvfile2:
			statCSV = csv.writer(csvfile2)
			rows2 = []
			row2 = ['Issue', 'UserType', 'Threshold', 'WeakStrongTN', 'WeakStrongTP', 'WeakStrongFN', 'WeakStrongFP', 'WeakStrongPrecision', 'WeakStrongRecall', 'WeakStrongAccuracy',\
			 'StrongTN', 'StrongTP', 'StrongFN', 'StrongFP', 'StrongPrecision', 'StrongRecall', 'StrongAccuracy'] 
			rows2.append(row2)	


			for issueID, services in votes.iteritems():
				issue = issueMap[issueID]
				if availableIssues.has_key(issue['keyword'].encode('utf-8'))==False:
					print 'issue not found -', issue['keyword']
					continue
				print 'processing...', issue['keyword']
				records = []
				for serviceID, vote in services.iteritems():
					service = serviceMap[serviceID]
					categories = service['categories']
					key = ''.join(categories + [service['name'], issue['keyword']])
					#print key.encode('utf-8').replace(" ", "")
					expSol = expertSols[key.replace(" ", "")]


					row = [userType] + categories + [service['name'], issue['keyword'], vote['agree'], vote['disagree'], vote['noidea'], expSol]
					records.append(row)
					row=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row]
					rows.append(row)

				#####################################################################################################

				# Thresholding
				weakPrecisions 	= []
				weakRecalls 	= []
				weakAccuracies 	= []

				strongPrecisions 	= []
				strongRecalls 		= []
				strongAccuracies 	= []

				thresholds = xrange(6)

				for threshold in thresholds:
					print '============= agree > disagree + ', threshold, " =============="
					weakTN		= 0
					weakTP		= 0
					weakFN 		= 0
					weakFP 		= 0
					strongTN	= 0
					strongTP	= 0
					strongFN	= 0
					strongFP	= 0

					for record in records:	

						agree 		= record[7]
						disagree	= record[8]
						solution 	= record[10]
						if agree+disagree<=threshold: #minimum number of votes
							continue
						if agree>(disagree+threshold): #predicted positive
							if solution>=1: # weak positive class
								weakTP 		+= 1
							if solution==2: # strong positive class
								strongTP 	+= 1
							if solution==0:
								weakFP 		+= 1
								strongFP	+= 1
						elif disagree>(agree+threshold): # predicted negative
							if solution>=1: # weak positive class
								weakFN 		+= 1
							if solution==2: # strong positive class
								strongFN 	+= 1
							if solution==0:
								weakTN 		+= 1
								strongTN	+= 1

					weakPrecision 	= 0
					if weakFP+weakTP!=0:
						weakPrecision 	= 1.0*weakTP/(weakFP+weakTP)
					weakRecall 		= 0
					if weakFN+weakTP!=0:
						weakRecall 		= 1.0*weakTP/(weakFN+weakTP)
					weakAccuracy 	= 0
					if (weakFN+weakTP+weakFP+weakTN)!=0:
						weakAccuracy 	= 1.0*(weakTP+weakTN)/(weakFN+weakTP+weakFP+weakTN)

					weakPrecisions.append(weakPrecision)
					weakRecalls.append(weakRecall)
					weakAccuracies.append(weakAccuracy)

					strongPrecision = 0
					if strongFP+strongTP!=0:
						strongPrecision = 1.0*strongTP/(strongFP+strongTP)
					strongRecall = 0
					if strongFN+strongTP!=0:
						strongRecall 	= 1.0*strongTP/(strongFN+strongTP)
					strongAccuracy  = 0
					if (strongFN+strongTP+strongFP+strongTN)!=0:
						strongAccuracy 	= 1.0*(strongTP+strongTN)/(strongFN+strongTP+strongFP+strongTN)

					strongPrecisions.append(strongPrecision)
					strongRecalls.append(strongRecall)
					strongAccuracies.append(strongAccuracy)

					print '  ----- Weak -----'
					print '  TN, FP = ', weakTN, ", ", weakFP
					print '  FN, TP = ', weakFN, ", ", weakTP
					print '  Precision = {:.2%}'.format(weakPrecision)
					print '  Recall = {:.2%}'.format(weakRecall)	
					print '  Accuracy = {:.2%}'.format(weakAccuracy)				
					print '  ----- Strong -----'
					print '  TN, FP = ', strongTN, ", ", strongFP
					print '  FN, TP = ', strongFN, ", ", strongTP					
					print '  Precision = {:.2%}'.format(strongPrecision)
					print '  Recall = {:.2%}'.format(strongRecall)	
					print '  Accuracy = {:.2%}'.format(strongAccuracy)		

					row2 = [issue['keyword'], userType, threshold, weakTN, weakTP, weakFN, weakFP, weakPrecision, weakRecall, weakAccuracy, \
					strongTN, strongTP, strongFN, strongFP, strongPrecision, strongRecall, strongAccuracy]

					row2=[ s.encode('utf-8') if isinstance(s, unicode) else s for s in row2]
					rows2.append(row2)	

				plt.figure(issue['keyword'])
				
				plt.grid(True)
				plt.subplot(121)
				plt.title("Weak+Strong")
				plt.plot(thresholds, weakPrecisions, 'r', label="Precision")
				plt.plot(thresholds, weakRecalls, 'g',  label="Recall")
				plt.plot(thresholds, weakAccuracies, 'b', label="Accuracy")
				plt.legend(loc='best', fontsize="small", framealpha=0.3)
				plt.ylabel("Percentage (%) ")
				plt.xlabel("agree > disagree + 'x'")
				plt.axis([0, 5, 0.0, 1.0])
				plt.subplot(122)
				plt.title("Strong")
				plt.plot(thresholds, strongPrecisions, 'r', label="Precision")
				plt.plot(thresholds, strongRecalls, 'g', label="Recall")
				plt.plot(thresholds, strongAccuracies, 'b', label="Accuracy")
				plt.legend(loc='best', fontsize="small", framealpha=0.3)
				plt.ylabel("Percentage (%) ")
				plt.xlabel("agree > disagree + 'x'")
				plt.axis([0, 5, 0.0, 1.0])
				plt.savefig(issue['keyword'])
    			# plt.show()

			statCSV.writerows(rows2)
				#####################################################################################################

		userCSV.writerows(rows)



	# Consider only Vote > n

			