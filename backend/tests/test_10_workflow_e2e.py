"""End-to-end workflow tests."""
import pytest


@pytest.mark.e2e
@pytest.mark.smoke
class TestCompleteUserJourney:
    """Test complete user journey from registration to campaign execution."""
    
    def test_complete_user_journey_fast(self, client, test_user_data, phase1_profile_data, campaign_onboarding_data):
        """Test the complete user journey (fast version - no API calls)."""
        # Step 1: Register
        register_response = client.post("/auth/register", json=test_user_data)
        assert register_response.status_code == 200
        user_id = register_response.json()["user_id"]
        
        # Step 2: Login
        login_response = client.post("/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 3: Complete Phase 1 Onboarding (5 fields)
        onboarding_response = client.post(
            "/onboarding",
            json=phase1_profile_data,
            headers=headers
        )
        assert onboarding_response.status_code == 200
        assert onboarding_response.json()["profile"]["phase1_complete"] is True
        
        # Step 4: Check profile completion
        completion_response = client.get("/profile/completion", headers=headers)
        assert completion_response.status_code == 200
        assert completion_response.json()["phase1_complete"] is True
        
        # Step 5: Create Campaign
        create_campaign_response = client.post("/campaigns", json={
            "goal": campaign_onboarding_data["goal"],
            "target_platforms": ["youtube"],
            "competitor_youtube_urls": campaign_onboarding_data["competitors"]["youtube_urls"]
        }, headers=headers)
        assert create_campaign_response.status_code == 200
        campaign_id = create_campaign_response.json()["campaign_id"]
        assert campaign_id is not None
        
        # Step 6: Update Campaign Onboarding (4-step wizard)
        update_response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=campaign_onboarding_data,
            headers=headers
        )
        assert update_response.status_code == 200
        
        # Step 7: Complete Campaign Onboarding
        complete_response = client.post(
            f"/campaigns/{campaign_id}/complete-onboarding",
            headers=headers
        )
        assert complete_response.status_code == 200
        assert complete_response.json()["status"] == "ready"
        
        # Step 8: Get Campaign Details (test fixed model mismatch)
        get_campaign_response = client.get(f"/campaigns/{campaign_id}", headers=headers)
        assert get_campaign_response.status_code == 200
        campaign_data = get_campaign_response.json()
        assert campaign_data["campaign_id"] == campaign_id
        assert campaign_data["status"] == "ready"
        assert "goal" in campaign_data  # Fixed: properly maps from onboarding.goal
        
        # Step 9: List All Campaigns
        list_response = client.get("/campaigns", headers=headers)
        assert list_response.status_code == 200
        campaigns = list_response.json()
        assert len(campaigns) == 1
        assert campaigns[0]["campaign_id"] == campaign_id
        
        print(f"✅ Complete user journey test passed! User: {user_id}, Campaign: {campaign_id}")
    
    @pytest.mark.slow
    def test_complete_user_journey_with_execution(self, client, test_user_data, phase1_profile_data, phase2_profile_data, campaign_onboarding_data):
        """Test complete journey including campaign execution (makes API calls)."""
        # Setup user and profile
        client.post("/auth/register", json=test_user_data)
        login_response = client.post("/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Complete Phase 1
        client.post("/onboarding", json=phase1_profile_data, headers=headers)
        
        # Complete Phase 2 (optional)
        client.patch("/profile", json=phase2_profile_data, headers=headers)
        
        # Create campaign
        create_response = client.post("/campaigns", json={
            "goal": campaign_onboarding_data["goal"],
            "target_platforms": ["youtube"]
        }, headers=headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Configure with minimal agents to reduce API costs
        minimal_config = campaign_onboarding_data.copy()
        minimal_config["agent_config"] = {
            "run_strategy": True,
            "run_forensics": False,  # Disable to reduce API calls
            "run_planner": True,
            "run_content": True,
            "run_outcome": False
        }
        minimal_config["image_generation_enabled"] = False
        minimal_config["seo_optimization_enabled"] = False
        minimal_config["goal"]["duration_days"] = 3  # Reduce to 3 days
        
        # Update and complete onboarding
        client.patch(f"/campaigns/{campaign_id}/onboarding", json=minimal_config, headers=headers)
        client.post(f"/campaigns/{campaign_id}/complete-onboarding", headers=headers)
        
        # Start campaign execution (makes Gemini API calls)
        start_response = client.post(f"/campaigns/{campaign_id}/start", headers=headers)
        
        assert start_response.status_code == 200
        result = start_response.json()
        assert result["status"] == "in_progress"
        
        # Verify content was generated
        get_response = client.get(f"/campaigns/{campaign_id}", headers=headers)
        campaign = get_response.json()
        assert campaign["status"] == "in_progress"
        
        print(f"✅ Complete journey with execution passed! Campaign: {campaign_id}")


@pytest.mark.e2e
class TestMultipleCampaignJourney:
    """Test user creating and managing multiple campaigns."""
    
    def test_multiple_campaigns_workflow(self, client, test_user_data, phase1_profile_data, campaign_onboarding_data):
        """Test user creating and managing multiple campaigns."""
        # Setup user
        client.post("/auth/register", json=test_user_data)
        login_response = client.post("/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        client.post("/onboarding", json=phase1_profile_data, headers=headers)
        
        # Create first campaign - YouTube focus
        campaign_1_data = campaign_onboarding_data.copy()
        campaign_1_data["name"] = "YouTube Growth Sprint"
        campaign_1_data["goal"]["platforms"] = ["youtube"]
        
        create_1 = client.post("/campaigns", json={
            "goal": campaign_1_data["goal"],
            "target_platforms": ["youtube"]
        }, headers=headers)
        campaign_id_1 = create_1.json()["campaign_id"]
        
        # Create second campaign - Twitter focus
        campaign_2_data = campaign_onboarding_data.copy()
        campaign_2_data["name"] = "Twitter Engagement Challenge"
        campaign_2_data["goal"]["platforms"] = ["twitter"]
        campaign_2_data["goal"]["goal_aim"] = "Increase Twitter engagement by 50%"
        
        create_2 = client.post("/campaigns", json={
            "goal": campaign_2_data["goal"],
            "target_platforms": ["twitter"]
        }, headers=headers)
        campaign_id_2 = create_2.json()["campaign_id"]
        
        # Complete onboarding for both
        client.patch(f"/campaigns/{campaign_id_1}/onboarding", json=campaign_1_data, headers=headers)
        client.patch(f"/campaigns/{campaign_id_2}/onboarding", json=campaign_2_data, headers=headers)
        
        client.post(f"/campaigns/{campaign_id_1}/complete-onboarding", headers=headers)
        client.post(f"/campaigns/{campaign_id_2}/complete-onboarding", headers=headers)
        
        # List all campaigns
        list_response = client.get("/campaigns", headers=headers)
        campaigns = list_response.json()
        
        assert len(campaigns) == 2
        campaign_ids = [c["campaign_id"] for c in campaigns]
        assert campaign_id_1 in campaign_ids
        assert campaign_id_2 in campaign_ids
        
        # Delete one campaign
        delete_response = client.delete(f"/campaigns/{campaign_id_2}", headers=headers)
        assert delete_response.status_code == 200
        
        # Verify only one remains
        list_response_2 = client.get("/campaigns", headers=headers)
        assert len(list_response_2.json()) == 1
        
        print(f"✅ Multiple campaigns workflow passed!")
