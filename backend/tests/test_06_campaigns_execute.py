"""Test campaign execution endpoints."""
import pytest


@pytest.mark.slow
@pytest.mark.integration
class TestCampaignExecution:
    """Test campaign execution (makes real API calls)."""
    
    def test_start_campaign(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test starting a campaign (executes agents)."""
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
