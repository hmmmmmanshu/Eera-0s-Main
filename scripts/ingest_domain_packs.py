#!/usr/bin/env python3
"""
Domain Packs Ingestion Script (Python version)
Parses Domain Packs.md and inserts into Supabase
"""

import os
import re
import json
from supabase import create_client, Client
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
OPENROUTER_KEY = os.getenv('VITE_OPENROUTER_API_KEY')

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENROUTER_KEY
openai.api_base = 'https://openrouter.ai/api/v1'

def generate_embedding(text: str):
    """Generate embedding using OpenAI via OpenRouter"""
    response = openai.Embedding.create(
        model='text-embedding-ada-002',
        input=text[:8000]
    )
    return response['data'][0]['embedding']

def parse_domain_packs(file_path: str):
    """Parse the Domain Packs markdown file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    items = []
    
    # Split by domains
    domain_pattern = r'# \*\*⭐ DOMAIN \d+ — ([^*\n]+)'
    domains = re.split(domain_pattern, content)
    
    for i in range(1, len(domains), 2):
        domain_name = domains[i].strip()
        domain_content = domains[i + 1]
        
        print(f"\n📦 Parsing: {domain_name}")
        
        # Parse principles
        items.extend(parse_principles(domain_name, domain_content))
        
        # Parse mistakes
        items.extend(parse_mistakes(domain_name, domain_content))
        
        # Parse mental models
        items.extend(parse_mental_models(domain_name, domain_content))
        
        # Parse frameworks
        items.extend(parse_frameworks(domain_name, domain_content))
    
    return items

def parse_principles(domain: str, content: str):
    """Extract principles from domain content"""
    items = []
    
    # Match principles section
    match = re.search(r'# \*\*✅.*?PRINCIPLES.*?\n(.*?)(?=# \*\*|$)', content, re.DOTALL | re.IGNORECASE)
    if not match:
        return items
    
    principles_text = match.group(1)
    
    # Extract numbered items
    for line in principles_text.split('\n'):
        m = re.match(r'^\d+\.\s+(.+)$', line.strip())
        if m:
            text = m.group(1).strip()
            # Clean markdown
            text = text.replace('\\>', '>').replace('**', '').replace('*', '')
            if len(text) > 10 and not text.startswith('#'):
                items.append({
                    'domain': domain,
                    'type': 'principle',
                    'name': text[:100],
                    'content': text
                })
    
    print(f"   ✅ Found {len(items)} principles")
    return items

def parse_mistakes(domain: str, content: str):
    """Extract mistakes from domain content"""
    items = []
    
    match = re.search(r'# \*\*❌.*?MISTAKES.*?\n(.*?)(?=# \*\*|$)', content, re.DOTALL | re.IGNORECASE)
    if not match:
        return items
    
    mistakes_text = match.group(1)
    
    for line in mistakes_text.split('\n'):
        m = re.match(r'^\d+\.\s+(.+)$', line.strip())
        if m:
            text = m.group(1).strip()
            text = text.replace('\\>', '>').replace('**', '').replace('*', '')
            if len(text) > 10 and not text.startswith('#'):
                items.append({
                    'domain': domain,
                    'type': 'mistake',
                    'name': text[:100],
                    'content': text
                })
    
    print(f"   ❌ Found {len(items)} mistakes")
    return items

def parse_mental_models(domain: str, content: str):
    """Extract mental models from domain content"""
    items = []
    
    match = re.search(r'# \*\*🧠.*?MENTAL MODELS.*?\n(.*?)(?=# \*\*|$)', content, re.DOTALL | re.IGNORECASE)
    if not match:
        return items
    
    models_text = match.group(1)
    
    # Match pattern: 1. **Name** → Description
    for m in re.finditer(r'\d+\.\s+\*\*(.+?)\*\*\s*[→:\-—]\s*(.+?)(?=\n\d+\.|\n\n|$)', models_text, re.DOTALL):
        name = m.group(1).strip()
        desc = m.group(2).strip()
        if name and desc:
            items.append({
                'domain': domain,
                'type': 'mental_model',
                'name': name,
                'content': f"{name}: {desc}"
            })
    
    print(f"   🧠 Found {len(items)} mental models")
    return items

def parse_frameworks(domain: str, content: str):
    """Extract frameworks from domain content"""
    items = []
    
    match = re.search(r'# \*\*🧩.*?FRAMEWORKS.*?\n(.*?)(?=# \*\*|$)', content, re.DOTALL | re.IGNORECASE)
    if not match:
        return items
    
    frameworks_text = match.group(1)
    
    for line in frameworks_text.split('\n'):
        m = re.match(r'^\d+\.\s+\*\*(.+?)\*\*', line.strip())
        if m:
            name = m.group(1).strip()
            if name:
                items.append({
                    'domain': domain,
                    'type': 'framework',
                    'name': name,
                    'content': name
                })
    
    print(f"   🧩 Found {len(items)} frameworks")
    return items

def get_tags_for_domain(domain: str):
    """Map domain to stage and domain tags"""
    domain_upper = domain.upper()
    
    if 'MARKETING' in domain_upper:
        return {
            'stage_tags': ['mvp', 'first_customers', 'early_revenue', 'pmf', 'growth'],
            'domain_tags': ['Marketing', 'GTM']
        }
    elif 'GTM' in domain_upper or 'GO-TO-MARKET' in domain_upper:
        return {
            'stage_tags': ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
            'domain_tags': ['GTM', 'Strategy']
        }
    elif 'SALES' in domain_upper:
        return {
            'stage_tags': ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
            'domain_tags': ['Sales', 'GTM']
        }
    elif 'TECH' in domain_upper or 'PRODUCT' in domain_upper:
        return {
            'stage_tags': ['idea', 'validation', 'mvp', 'first_customers', 'early_revenue', 'pmf'],
            'domain_tags': ['Product', 'Tech']
        }
    elif 'OPERATIONS' in domain_upper or 'OPS' in domain_upper:
        return {
            'stage_tags': ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
            'domain_tags': ['Ops']
        }
    elif 'LEADERSHIP' in domain_upper or 'HR' in domain_upper:
        return {
            'stage_tags': ['early_revenue', 'pmf', 'seed', 'growth'],
            'domain_tags': ['Leadership', 'HR']
        }
    elif 'FINANCE' in domain_upper:
        return {
            'stage_tags': ['early_revenue', 'pmf', 'seed', 'growth'],
            'domain_tags': ['Finance']
        }
    else:
        return {
            'stage_tags': ['idea', 'validation', 'mvp'],
            'domain_tags': ['Strategy']
        }

def ingest_items(items):
    """Insert items into Supabase"""
    print(f"\n📊 Ingesting {len(items)} items...\n")
    
    inserted = 0
    for i, item in enumerate(items):
        try:
            print(f"[{i+1}/{len(items)}] {item['name'][:60]}...")
            
            # Generate embedding
            embedding = generate_embedding(item['content'])
            
            # Get tags
            tags_info = get_tags_for_domain(item['domain'])
            
            # Determine priority
            priority = 'high' if item['type'] in ['framework', 'principle', 'decision_tree'] else 'medium'
            
            # Insert
            data = {
                'book_title': f"Domain Pack: {item['domain']}",
                'book_author': 'EERA Knowledge Base',
                'book_category': item['domain'],
                'chunk_type': item['type'],
                'chunk_name': item['name'],
                'description': item['content'],
                'components': [item['type'].replace('_', ' ').title()],
                'when_applies': f"Relevant for {', '.join(tags_info['domain_tags'])} at stages: {', '.join(tags_info['stage_tags'])}",
                'tags': [item['domain'].lower(), item['type']],
                'stage_tags': tags_info['stage_tags'],
                'domain_tags': tags_info['domain_tags'],
                'priority': priority,
                'embedding': embedding
            }
            
            result = supabase.table('mentor_knowledge_base').insert(data).execute()
            
            if result.data:
                print(f"   ✅ Inserted")
                inserted += 1
            else:
                print(f"   ❌ Failed")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    return inserted

def main():
    print("🚀 Domain Packs Ingestion (Python)\n")
    
    file_path = os.path.join(os.getcwd(), 'data', 'mentor-knowledge', 'Domain Packs.md')
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return
    
    # Parse
    items = parse_domain_packs(file_path)
    print(f"\n✅ Parsed {len(items)} total items")
    
    # Ingest
    inserted = ingest_items(items)
    
    print(f"\n{'='*80}")
    print(f"✅ Complete! Inserted {inserted}/{len(items)} items")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()

