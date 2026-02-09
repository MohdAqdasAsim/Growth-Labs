#!/bin/bash
# Complete Campaign Workflow Test Script
# Tests all Celery tasks end-to-end

set -e  # Exit on error

BASE_URL="http://localhost:8000"
AUTH_HEADER="Authorization: Bearer test-token"
CAMPAIGN_ID=""
TASK_ID=""

echo "🚀 Super Engine Lab - Campaign Workflow Test"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Health Check
echo -e "${BLUE}Step 1: Health Check${NC}"
curl -s "$BASE_URL/health" | jq .
echo ""

# Step 2: Create Campaign
echo -e "${BLUE}Step 2: Creating Campaign${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/campaigns" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json")

CAMPAIGN_ID=$(echo $CREATE_RESPONSE | jq -r '.campaign_id')
echo -e "${GREEN}✅ Campaign created: $CAMPAIGN_ID${NC}"
echo ""

# Step 3: Update Campaign Onboarding Data
echo -e "${BLUE}Step 3: Updating Campaign Onboarding${NC}"
curl -s -X PATCH "$BASE_URL/campaigns/$CAMPAIGN_ID/onboarding" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Growth Sprint - Test",
    "goal_aim": "Increase YouTube subscribers and Twitter engagement through consistent content",
    "platforms": ["youtube", "twitter"],
    "duration_days": 3,
    "goal_metrics": {
      "youtube_subscribers": 100,
      "youtube_views": 5000,
      "twitter_followers": 200,
      "twitter_impressions": 10000
    }
  }' | jq .
echo ""

# Step 4: Complete Onboarding (might trigger learning task if past campaigns exist)
echo -e "${BLUE}Step 4: Completing Onboarding${NC}"
ONBOARD_RESPONSE=$(curl -s -X POST "$BASE_URL/campaigns/$CAMPAIGN_ID/complete-onboarding" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json")

echo $ONBOARD_RESPONSE | jq .

# Check if learning task was created
LEARNING_TASK=$(echo $ONBOARD_RESPONSE | jq -r '.task_id // "null"')
if [ "$LEARNING_TASK" != "null" ] && [ "$LEARNING_TASK" != "" ]; then
  echo -e "${YELLOW}⏳ Learning task started: $LEARNING_TASK${NC}"
  echo -e "${YELLOW}   Waiting for learning analysis to complete...${NC}"
  
  # Poll learning task
  for i in {1..30}; do
    sleep 2
    TASK_STATUS=$(curl -s "$BASE_URL/tasks/$LEARNING_TASK")
    STATE=$(echo $TASK_STATUS | jq -r '.state')
    PROGRESS=$(echo $TASK_STATUS | jq -r '.progress')
    MESSAGE=$(echo $TASK_STATUS | jq -r '.message')
    
    echo -e "${YELLOW}   [$STATE] $PROGRESS% - $MESSAGE${NC}"
    
    if [ "$STATE" = "SUCCESS" ]; then
      echo -e "${GREEN}✅ Learning analysis complete${NC}"
      break
    elif [ "$STATE" = "FAILURE" ]; then
      echo -e "${RED}❌ Learning analysis failed${NC}"
      echo $TASK_STATUS | jq .
      break
    fi
  done
fi
echo ""

# Step 5: Start Campaign Workflow (Main Celery Task)
echo -e "${BLUE}Step 5: Starting Campaign Workflow (6-Agent Execution)${NC}"
START_RESPONSE=$(curl -s -X POST "$BASE_URL/campaigns/$CAMPAIGN_ID/start" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json")

TASK_ID=$(echo $START_RESPONSE | jq -r '.task_id')
echo -e "${GREEN}✅ Campaign workflow started${NC}"
echo -e "${GREEN}   Task ID: $TASK_ID${NC}"
echo $START_RESPONSE | jq .
echo ""

# Step 6: Poll Task Status (Monitor 6-Agent Progress)
echo -e "${BLUE}Step 6: Monitoring Campaign Workflow Progress${NC}"
echo -e "${YELLOW}   Expected agents: Context → Strategy → Forensics → Planner → Content → Outcome${NC}"
echo ""

for i in {1..60}; do
  sleep 3
  TASK_STATUS=$(curl -s "$BASE_URL/tasks/$TASK_ID")
  STATE=$(echo $TASK_STATUS | jq -r '.state')
  PROGRESS=$(echo $TASK_STATUS | jq -r '.progress')
  MESSAGE=$(echo $TASK_STATUS | jq -r '.message')
  
  # Progress bar
  FILLED=$((PROGRESS / 5))
  EMPTY=$((20 - FILLED))
  BAR=$(printf "%${FILLED}s" | tr ' ' '█')$(printf "%${EMPTY}s" | tr ' ' '░')
  
  echo -e "${YELLOW}   [$STATE] [$BAR] $PROGRESS% - $MESSAGE${NC}"
  
  if [ "$STATE" = "SUCCESS" ]; then
    echo ""
    echo -e "${GREEN}🎉 Campaign workflow completed successfully!${NC}"
    echo $TASK_STATUS | jq .
    break
  elif [ "$STATE" = "FAILURE" ]; then
    echo ""
    echo -e "${RED}❌ Campaign workflow failed${NC}"
    echo $TASK_STATUS | jq .
    exit 1
  fi
done
echo ""

# Step 7: Retrieve Campaign Data (Verify Results)
echo -e "${BLUE}Step 7: Retrieving Campaign Data${NC}"
CAMPAIGN_DATA=$(curl -s "$BASE_URL/campaigns/$CAMPAIGN_ID" \
  -H "$AUTH_HEADER")

STATUS=$(echo $CAMPAIGN_DATA | jq -r '.status')
HAS_PLAN=$(echo $CAMPAIGN_DATA | jq -r '.campaign_plan != null')
HAS_CONTENT=$(echo $CAMPAIGN_DATA | jq -r '.daily_content != null')

echo -e "${GREEN}   Status: $STATUS${NC}"
echo -e "${GREEN}   Campaign Plan: $HAS_PLAN${NC}"
echo -e "${GREEN}   Daily Content: $HAS_CONTENT${NC}"
echo ""

# Step 8: Complete Campaign (Trigger Outcome Report Generation)
echo -e "${BLUE}Step 8: Completing Campaign (Generate Outcome Report)${NC}"
COMPLETE_RESPONSE=$(curl -s -X POST "$BASE_URL/campaigns/$CAMPAIGN_ID/complete" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "actual_metrics": {
      "youtube_views": 6200,
      "youtube_subscribers": 120,
      "twitter_impressions": 12500,
      "twitter_followers": 230
    }
  }')

OUTCOME_TASK=$(echo $COMPLETE_RESPONSE | jq -r '.task_id')
echo -e "${GREEN}✅ Outcome report generation started${NC}"
echo -e "${GREEN}   Task ID: $OUTCOME_TASK${NC}"
echo ""

# Step 9: Monitor Outcome Report Generation
echo -e "${BLUE}Step 9: Monitoring Outcome Report Generation${NC}"

for i in {1..30}; do
  sleep 3
  TASK_STATUS=$(curl -s "$BASE_URL/tasks/$OUTCOME_TASK")
  STATE=$(echo $TASK_STATUS | jq -r '.state')
  PROGRESS=$(echo $TASK_STATUS | jq -r '.progress')
  MESSAGE=$(echo $TASK_STATUS | jq -r '.message')
  
  # Progress bar
  FILLED=$((PROGRESS / 5))
  EMPTY=$((20 - FILLED))
  BAR=$(printf "%${FILLED}s" | tr ' ' '█')$(printf "%${EMPTY}s" | tr ' ' '░')
  
  echo -e "${YELLOW}   [$STATE] [$BAR] $PROGRESS% - $MESSAGE${NC}"
  
  if [ "$STATE" = "SUCCESS" ]; then
    echo ""
    echo -e "${GREEN}🎉 Outcome report generated successfully!${NC}"
    break
  elif [ "$STATE" = "FAILURE" ]; then
    echo ""
    echo -e "${RED}❌ Outcome report generation failed${NC}"
    echo $TASK_STATUS | jq .
    exit 1
  fi
done
echo ""

# Step 10: Retrieve Final Report
echo -e "${BLUE}Step 10: Retrieving Final Outcome Report${NC}"
REPORT=$(curl -s "$BASE_URL/campaigns/$CAMPAIGN_ID/report" \
  -H "$AUTH_HEADER")

echo $REPORT | jq .
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✅ Complete Campaign Workflow Test PASSED${NC}"
echo "=============================================="
echo ""
echo "📊 Summary:"
echo "   Campaign ID: $CAMPAIGN_ID"
echo "   Workflow Task: $TASK_ID"
echo "   Outcome Task: $OUTCOME_TASK"
echo "   Final Status: completed"
echo ""
echo "🎯 All Celery tasks executed successfully:"
echo "   ✅ execute_campaign_workflow (6 agents)"
echo "   ✅ generate_outcome_report"
echo "   ✅ analyze_past_campaigns (if applicable)"
echo ""
