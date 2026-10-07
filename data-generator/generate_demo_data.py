#!/usr/bin/env python3
"""
Project SUTRA - Synthetic Demo Data Generator
Generates dummy CDR (Call Detail Records) and Bank Transaction CSVs
for testing the intelligence graph platform.

Usage:
    python generate_demo_data.py
"""

import csv
import random
import os
from datetime import datetime, timedelta

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
NUM_CDR_RECORDS = 50
NUM_BANK_RECORDS = 30

# Suspect phone numbers pool
PHONES = [
    '+971-501234567', '+91-9876543210', '+91-9811223344',
    '+91-9988776655', '+971-509876543', '+91-7766554433',
    '+91-8899001122', '+971-507778899',
]

# Suspect names pool
NAMES = [
    'Vikram Deshmukh', 'Rahul Kapoor', 'Amir Sheikh',
    'Priya Mehta', 'Karan Singh', 'Deepak Joshi',
]

# Bank accounts pool
ACCOUNTS = [
    'HDFC-998822', 'SBI-554411', 'ICICI-773300',
    'PNB-662211', 'BOB-889944', 'AXIS-445566',
]

# Cell towers
TOWERS = [
    'Pune-Sector 4 (Tower B)', 'Mumbai-Roaming Node',
    'Jaipur-Central Hub', 'Delhi-South Extension',
    'Hyderabad-Madhapur', 'Bangalore-Whitefield',
]

FLAGS = ['CRITICAL', 'SUSPICIOUS', 'NORMAL', 'NORMAL', 'NORMAL']


def generate_cdrs():
    """Generate synthetic Call Detail Records."""
    records = []
    base_time = datetime(2026, 3, 28, 0, 0, 0)
    
    for i in range(NUM_CDR_RECORDS):
        caller = random.choice(PHONES)
        receiver = random.choice([p for p in PHONES if p != caller])
        duration_secs = random.randint(15, 2700)
        minutes = duration_secs // 60
        secs = duration_secs % 60
        tower = random.choice(TOWERS)
        timestamp = base_time + timedelta(
            hours=random.randint(0, 72),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59)
        )
        flag = random.choice(FLAGS)
        
        records.append({
            'record_id': f'CDR-{9000 + i}',
            'caller': caller,
            'receiver': receiver,
            'duration': f'{minutes:02d}m {secs:02d}s',
            'cell_tower': tower,
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'threat_flag': flag,
        })
    
    return records


def generate_bank_transactions():
    """Generate synthetic bank transaction records."""
    records = []
    base_time = datetime(2026, 1, 15, 0, 0, 0)
    
    for i in range(NUM_BANK_RECORDS):
        sender = random.choice(ACCOUNTS)
        receiver = random.choice([a for a in ACCOUNTS if a != sender])
        sender_name = random.choice(NAMES)
        receiver_name = random.choice([n for n in NAMES if n != sender_name])
        amount = random.choice([
            random.randint(5000, 50000),
            random.randint(100000, 1500000),
            random.randint(50000, 500000),
        ])
        timestamp = base_time + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(8, 22),
            minutes=random.randint(0, 59)
        )
        
        records.append({
            'txn_id': f'TXN-{10000 + i}',
            'sender_account': sender,
            'sender_name': sender_name,
            'receiver_account': receiver,
            'receiver_name': receiver_name,
            'amount_inr': amount,
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'mode': random.choice(['NEFT', 'RTGS', 'UPI', 'CASH_DEPOSIT', 'WIRE']),
            'flag': random.choice(['NORMAL', 'SUSPICIOUS', 'HAWALA_PATTERN']),
        })
    
    return records


def write_csv(filename, records, fieldnames):
    """Write records to a CSV file."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"  ✅ Generated {len(records)} records → {filepath}")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("\n🔍 Project SUTRA — Demo Data Generator")
    print("=" * 45)
    
    # Generate CDRs
    print("\n📞 Generating Call Detail Records...")
    cdrs = generate_cdrs()
    write_csv('demo_cdrs.csv', cdrs, [
        'record_id', 'caller', 'receiver', 'duration',
        'cell_tower', 'timestamp', 'threat_flag'
    ])
    
    # Generate Bank Transactions
    print("\n💳 Generating Bank Transaction Records...")
    txns = generate_bank_transactions()
    write_csv('demo_bank_transactions.csv', txns, [
        'txn_id', 'sender_account', 'sender_name',
        'receiver_account', 'receiver_name', 'amount_inr',
        'timestamp', 'mode', 'flag'
    ])
    
    print(f"\n✅ All demo data generated in: {OUTPUT_DIR}")
    print("   Use these CSVs with Project SUTRA's Evidence Ingestion portal.\n")


if __name__ == '__main__':
    main()
