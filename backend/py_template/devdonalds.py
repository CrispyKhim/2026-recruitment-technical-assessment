from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re

# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
	name: str

@dataclass
class RequiredItem():
	name: str
	quantity: int

@dataclass
class Recipe(CookbookEntry):
	required_items: List[RequiredItem]

@dataclass
class Ingredient(CookbookEntry):
	cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
# Change `cookbook = None` into `cookbook = []`
cookbook = []

# Task 1 helper (don't touch)
@app.route("/parse", methods=['POST'])
def parse():
	data = request.get_json()
	recipe_name = data.get('input', '')
	parsed_name = parse_handwriting(recipe_name)
	if parsed_name is None:
		return 'Invalid recipe name', 400
	return jsonify({'msg': parsed_name}), 200

# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a form that 
def parse_handwriting(recipeName: str) -> Union[str | None]:
	# TODO: implement me
	# 1: Return None if the string is empty
	if len(recipeName) == 0:
		return None

	# 2: Replace hyphens and underscores with whitespace
	recipeName = re.sub(r'[-_]+', ' ', recipeName)
	
	# 3: Contain only letters and whitespace; remove any other characters
	recipeName = re.sub(r'[^a-zA-Z\s]', '', recipeName)

	# 4: Capitalise the first letter of each word
	recipeName = recipeName.title()

	# 5: Only one whitespace between words
	recipeName = re.sub(r'\s+', ' ', recipeName).strip()

	# Return the result
	return recipeName


# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route('/entry', methods=['POST'])
def create_entry():
	entry = request.get_json()

	# 1: Type can only be "recipe" or "ingredient"
	if entry.get('type') != 'recipe' and entry.get('type') != 'ingredient':
		return jsonify({'error': 'Invalid entry type'}), 400

	# 2: cookTime must be greater than or equal to 0
	if entry.get('type') == 'ingredient' and entry.get('cookTime', -1) < 0:
		return jsonify({'error': 'Invalid cookTime'}), 400

	# 3: Name must be unique
	for element in cookbook:
		if element.get('name') == entry.get('name'):
			return jsonify({'error': 'Invalid entry name'}), 400

	# 4: RequiredItems can only have one element per name
	if entry.get('type') == 'recipe' and len(entry.get('requiredItems', [])) > 1:
		return jsonify({'error': 'Invalid entry requiredItems'}), 400

	# Add the entry to the cookbook
	cookbook.append(entry)
	return jsonify({}), 200


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route('/summary', methods=['GET'])
def summary():
	# TODO: implement me
	return 'not implemented', 500


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
	app.run(debug=True, port=8080)
