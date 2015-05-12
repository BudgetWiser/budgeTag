# -*- coding: utf-8 -*-

import csv, json, time
from konlpy.tag import Kkma


origdata = open('seoul2015.tsv', 'r')
data = csv.reader(origdata, delimiter='\t')

output = []
kkma = Kkma()
i = 0

for line in data:
    i += 1

    if(line[8].strip().isdigit()):
        obj = {
            'name': line[7].strip(),
            'sum': line[8].strip(),
            'categories': [
                line[2].strip(),
                line[3].strip(),
                line[4].strip(),
                line[5].strip()
            ]
        }

        words = kkma.nouns(line[7].strip().decode('utf-8'))
        for j, word in enumerate(words):
            words[j] = word.encode('utf-8')

        obj['words'] = words

        print str(i) + ' / 4014'

        output.append(obj)

jsonfile = open('./data/services.json', 'w')

json.dump(output, jsonfile)

print '--- finished ---'
