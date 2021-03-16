# Read entries from JSON file; create new file with entries
# in a new (randomized) order

import json
import random

# Read in the file (assumes it is in current working directory)
with open('questions.json') as f:
    questionDict = json.load(f)

# There is only the 1 list as the 1 object's value
questionList = list(questionDict.values())[0]

'''
# For debugging
for q in questionList:
  print(q)

'''

# Shuffle the order of the questions in the list
random.shuffle(questionList)

'''
# For debugging
for q in questionList:
  print(q)

'''

# Recreate the "outer-level" dictionary, then
# write it to file in current working directory
newQuestionDict = {'questions': questionList}
with open('questionsShuffled.json', 'w') as f:
    json.dump(newQuestionDict, f, indent=4)
