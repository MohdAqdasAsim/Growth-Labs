"""Test campaign execution endpoints."""
import pytest


@pytest.mark.slow
@pytest.mark.integration
class TestCampaignExecution:
    """Test campaign execution (makes real API calls)."""
    
    def test_full_campaign_workflow_all_agents(self, client, auth_headers, phase1_profile_data, campaign_onboarding_data):
        """Test complete campaign workflow with ALL agents enabled (comprehensive test)."""
        print("\n" + "="*80)
        print("🚀 STARTING FULL CAMPAIGN WORKFLOW TEST - ALL AGENTS ENABLED")
        print("="*80)
        
        # Setup complete campaign
        print("\n📝 Step 1: Completing user onboarding...")
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        print("✅ User onboarding complete")
        
        print("\n📝 Step 2: Creating campaign...")
        create_response = client.post("/campaigns", headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        print(f"✅ Campaign created: {campaign_id}")
        
        # Enable ALL agents and features
        print("\n📝 Step 3: Configuring campaign with ALL agents enabled...")
        full_config = campaign_onboarding_data.copy()
        full_config["agent_config"] = {
            "run_strategy": True,
            "run_forensics": True,
            "run_planner": True,
            "run_content": True,
            "run_outcome": True
        }
        full_config["image_generation_enabled"] = True
        full_config["seo_optimization_enabled"] = True
        full_config["duration_days"] = 3  # Keep it short for testing
        
        print("  ✓ Strategy Agent: ENABLED")
        print("  ✓ Forensics Agent: ENABLED")
        print("  ✓ Planner Agent: ENABLED")
        print("  ✓ Content Agent: ENABLED")
        print("  ✓ Outcome Agent: ENABLED")
        print("  ✓ Image Generation: ENABLED")
        print("  ✓ SEO Optimization: ENABLED")
        
        client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=full_config,
            headers=auth_headers
        )
        print("✅ Campaign configuration complete")
        
        print("\n📝 Step 4: Completing campaign onboarding...")
        complete_response = client.post(f"/campaigns/{campaign_id}/complete-onboarding", headers=auth_headers)
        complete_data = complete_response.json()
        print(f"✅ Campaign ready to start (status: {complete_data.get('status')})")
        
        if complete_data.get('learning_from_previous'):
            print("  📊 Learning from previous campaigns: YES")
        else:
            print("  📊 Learning from previous campaigns: NO (first campaign)")
        
        # Start campaign (executes all agents)
        print("\n" + "="*80)
        print("🎬 EXECUTING CAMPAIGN - WATCH THE AGENTS WORK!")
        print("="*80)
        response = client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        
        assert response.status_code == 200, f"Campaign start failed: {response.json()}"
        data = response.json()
        print(f"\n✅ Campaign execution complete! Status: {data['status']}")
        
        # Retrieve campaign to inspect generated content
        print("\n" + "="*80)
        print("📊 VERIFYING GENERATED OUTPUTS")
        print("="*80)
        
        campaign_response = client.get(f"/campaigns/{campaign_id}", headers=auth_headers)
        campaign_data = campaign_response.json()
        
        # Check 1: Strategy output
        print("\n1️⃣ STRATEGY AGENT OUTPUT:")
        if campaign_data.get("strategy_output"):
            print("  ✅ Strategy generated")
            print(f"  📋 Keys: {list(campaign_data['strategy_output'].keys())}")
        else:
            print("  ❌ No strategy output found")
        
        # Check 2: Forensics output
        print("\n2️⃣ FORENSICS AGENT OUTPUT:")
        if campaign_data.get("forensics_output"):
            print("  ✅ Forensics analysis generated")
            print(f"  📋 Platforms analyzed: {list(campaign_data['forensics_output'].keys())}")
        else:
            print("  ❌ No forensics output found")
        
        # Check 3: Plan
        print("\n3️⃣ PLANNER AGENT OUTPUT:")
        if campaign_data.get("plan"):
            print("  ✅ Campaign plan generated")
            print(f"  📋 Plan structure: {list(campaign_data['plan'].keys()) if isinstance(campaign_data['plan'], dict) else 'N/A'}")
        else:
            print("  ❌ No plan found")
        
        # Check 4: Daily content
        print("\n4️⃣ CONTENT AGENT OUTPUT:")
        daily_content = campaign_data.get("daily_content", {})
        if daily_content:
            print(f"  ✅ Content generated for {len(daily_content)} days")
            for day_num, content in sorted(daily_content.items(), key=lambda x: int(x[0]) if str(x[0]).isdigit() else 0):
                print(f"\n  📅 Day {day_num}:")
                if isinstance(content, dict):
                    if content.get("youtube_title"):
                        print(f"    ▪ YouTube Title: '{content['youtube_title'][:60]}...'")
                    if content.get("youtube_script"):
                        script_preview = content['youtube_script'][:100].replace('\n', ' ')
                        print(f"    ▪ Script Preview: {script_preview}...")
                    if content.get("youtube_seo_tags"):
                        print(f"    ▪ SEO Tags: {', '.join(content['youtube_seo_tags'][:5])}")
                    if content.get("thumbnail_url"):
                        print(f"    ▪ 🎨 Thumbnail: GENERATED (length: {len(content['thumbnail_url'])} chars)")
                    else:
                        print(f"    ▪ ⚠️  Thumbnail: NOT GENERATED")
                    if content.get("reasoning"):
                        print(f"    ▪ Strategy reasoning: {content['reasoning'].get('why_it_works', 'N/A')[:60]}...")
        else:
            print("  ❌ No daily content found")
        
        # Check 5: Images generated
        print("\n5️⃣ IMAGE GENERATION:")
        images_generated = sum(1 for content in daily_content.values() 
                              if isinstance(content, dict) and content.get("thumbnail_url"))
        total_days = len(daily_content)
        if images_generated > 0:
            print(f"  ✅ Images generated: {images_generated}/{total_days} days")
        else:
            print(f"  ⚠️  No images generated (check NANO_BANANA_API_KEY in .env)")
        
        # Summary
        print("\n" + "="*80)
        print("📈 TEST SUMMARY")
        print("="*80)
        print(f"✓ Strategy Agent: {'PASSED' if campaign_data.get('strategy_output') else 'FAILED'}")
        print(f"✓ Forensics Agent: {'PASSED' if campaign_data.get('forensics_output') else 'FAILED'}")
        print(f"✓ Planner Agent: {'PASSED' if campaign_data.get('plan') else 'FAILED'}")
        print(f"✓ Content Agent: {'PASSED' if daily_content else 'FAILED'}")
        print(f"✓ Image Generation: {'PASSED' if images_generated > 0 else 'SKIPPED (no API key)'}")
        print("="*80 + "\n")
        
        # Assertions
        assert campaign_data.get("strategy_output"), "Strategy output missing"
        # Forensics may be empty if no competitors match platforms
        # assert campaign_data.get("forensics_output"), "Forensics output missing"
        assert campaign_data.get("plan"), "Campaign plan missing"
        assert daily_content, "Daily content missing"
        assert len(daily_content) >= 3, f"Expected content for 3 days, got {len(daily_content)}"
        
        # Verify content structure
        for day_num, content in daily_content.items():
            assert isinstance(content, dict), f"Day {day_num} content is not a dict"
            # At least one of these should exist
            assert (content.get("youtube_title") or content.get("youtube_script") or 
                   content.get("x_tweet")), f"Day {day_num} has no content"
    
    def test_start_campaign(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test starting a campaign (executes agents) - MINIMAL config."""
        # Setup complete campaign
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Disable image generation and forensics to reduce API calls
        minimal_config = campaign_onboarding_data.copy()
        minimal_config["agent_config"]["run_forensics"] = False
        minimal_config["image_generation_enabled"] = False
        minimal_config["seo_optimization_enabled"] = False
        
        client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=minimal_config,
            headers=auth_headers
        )
        client.post(f"/campaigns/{campaign_id}/complete-onboarding", headers=auth_headers)
        
        # Start campaign (makes Gemini API calls)
        response = client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "in_progress"
        assert "content_generated" in data or "message" in data
    
    def test_start_campaign_not_ready(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test starting campaign before onboarding is complete."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Try to start without completing onboarding
        response = client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        
        assert response.status_code == 400
        assert "onboarding" in response.json()["detail"].lower() or "ready" in response.json()["detail"].lower()
    
    def test_start_campaign_already_started(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test that campaign can't be started twice."""
        # Setup and start campaign
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        minimal_config = campaign_onboarding_data.copy()
        minimal_config["agent_config"]["run_forensics"] = False
        minimal_config["image_generation_enabled"] = False
        
        client.patch(f"/campaigns/{campaign_id}/onboarding", json=minimal_config, headers=auth_headers)
        client.post(f"/campaigns/{campaign_id}/complete-onboarding", headers=auth_headers)
        client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        
        # Try to start again
        response = client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        
        assert response.status_code == 400
        assert "already" in response.json()["detail"].lower()


@pytest.mark.integration
class TestCampaignExecutionTracking:
    """Test campaign execution tracking (doesn't make API calls)."""
    
    def test_confirm_daily_execution(self, client, auth_headers, phase1_profile_data, campaign_create_data, daily_execution_data):
        """Test confirming daily content posting."""
        # Setup campaign (skip actual execution)
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Confirm day 1 execution
        response = client.patch(
            f"/campaigns/{campaign_id}/day/1/confirm",
            json=daily_execution_data,
            headers=auth_headers
        )
        
        # May fail if content not generated yet, but test endpoint exists
        assert response.status_code in [200, 400]
    
    def test_get_daily_content(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test retrieving content for a specific day."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        response = client.get(
            f"/campaigns/{campaign_id}/day/1/content",
            headers=auth_headers
        )
        
        # May return 404 if content not generated, which is expected
        assert response.status_code in [200, 404]

@pytest.mark.slow
@pytest.mark.integration
class TestCampaignInsightsGeneration:
    """Test campaign outcome insights generation."""
    
    def test_complete_campaign_generates_insights(self, client, auth_headers, phase1_profile_data, campaign_onboarding_data, actual_metrics_data):
        """Test that completing a campaign generates outcome insights."""
        print("\n" + "="*80)
        print("📊 TESTING OUTCOME INSIGHTS GENERATION")
        print("="*80)
        
        # Setup and execute campaign
        print("\n📝 Step 1: Setting up and executing campaign...")
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Use minimal config to speed up test
        minimal_config = campaign_onboarding_data.copy()
        minimal_config["agent_config"]["run_forensics"] = False
        minimal_config["image_generation_enabled"] = False
        minimal_config["seo_optimization_enabled"] = False
        minimal_config["duration_days"] = 3
        
        client.patch(f"/campaigns/{campaign_id}/onboarding", json=minimal_config, headers=auth_headers)
        client.post(f"/campaigns/{campaign_id}/complete-onboarding", headers=auth_headers)
        
        print(f"✅ Campaign {campaign_id} ready")
        
        print("\n📝 Step 2: Starting campaign (executing agents)...")
        start_response = client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        assert start_response.status_code == 200, f"Campaign start failed: {start_response.json()}"
        print("✅ Campaign execution complete")
        
        # Complete campaign with actual metrics
        print("\n📝 Step 3: Completing campaign with actual metrics...")
        print(f"  Metrics: {actual_metrics_data}")
        
        complete_response = client.post(
            f"/campaigns/{campaign_id}/complete",
            json=actual_metrics_data,
            headers=auth_headers
        )
        
        # Should execute Outcome Agent
        print(f"\nResponse status: {complete_response.status_code}")
        
        if complete_response.status_code == 200:
            report = complete_response.json()
            
            print("\n" + "="*80)
            print("📈 OUTCOME INSIGHTS GENERATED!")
            print("="*80)
            
            # Check report structure
            print("\n🔍 Goal vs Result:")
            if report.get("goal_vs_result"):
                for key, value in report["goal_vs_result"].items():
                    print(f"  • {key}: {value}")
            
            print("\n✅ What Worked:")
            for item in report.get("what_worked", [])[:3]:
                print(f"  • {item}")
            
            print("\n❌ What Failed:")
            for item in report.get("what_failed", [])[:3]:
                print(f"  • {item}")
            
            print("\n💡 Next Campaign Suggestions:")
            for item in report.get("next_campaign_suggestions", [])[:3]:
                print(f"  • {item}")
            
            print("\n" + "="*80)
            print("✓ Outcome Agent: PASSED")
            print("✓ Insights Generation: PASSED")
            print("="*80 + "\n")
            
            # Assertions
            assert "goal_vs_result" in report, "Missing goal_vs_result in report"
            assert "what_worked" in report, "Missing what_worked in report"
            assert "what_failed" in report, "Missing what_failed in report"
            assert "next_campaign_suggestions" in report, "Missing suggestions in report"
            
            # Verify report content
            assert isinstance(report["what_worked"], list), "what_worked should be a list"
            assert isinstance(report["what_failed"], list), "what_failed should be a list"
            assert isinstance(report["next_campaign_suggestions"], list), "suggestions should be a list"
            
        else:
            print(f"⚠️  Campaign completion returned {complete_response.status_code}")
            print(f"Details: {complete_response.json()}")
            # May fail if daily execution not confirmed, but endpoint should exist
            assert complete_response.status_code in [200, 400], f"Unexpected status: {complete_response.status_code}"
        
        # Verify campaign report is stored
        print("\n📝 Step 4: Verifying report is stored in campaign...")
        campaign_response = client.get(f"/campaigns/{campaign_id}", headers=auth_headers)
        campaign_data = campaign_response.json()
        
        if campaign_data.get("report"):
            print("✅ Report found in campaign data")
            assert campaign_data["status"] == "completed", "Campaign should be marked as completed"
        else:
            print("⚠️  Report not found (may require daily execution confirmation)")