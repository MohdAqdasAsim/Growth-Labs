"""Test campaign creation and onboarding endpoints."""
import pytest


@pytest.mark.integration
class TestCampaignCreation:
    """Test campaign creation flow (separated from execution)."""
    
    def test_create_campaign_success(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test successful campaign creation."""
        # Complete Phase 1 first
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Create campaign
        response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "campaign_id" in data
        assert data["status"] == "onboarding_incomplete"
        assert "message" in data
    
    def test_create_campaign_requires_phase1(self, client, auth_headers, campaign_create_data):
        """Test that campaign creation requires Phase 1 completion."""
        response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        
        assert response.status_code == 400
        assert "phase 1" in response.json()["detail"].lower()
    
    def test_create_campaign_missing_goal(self, client, auth_headers, phase1_profile_data):
        """Test campaign creation with missing goal."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        invalid_data = {
            "target_platforms": ["youtube"]
            # Missing goal
        }
        
        response = client.post("/campaigns", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
    
    def test_create_multiple_campaigns(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test creating multiple campaigns for same user."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Create first campaign
        response1 = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id_1 = response1.json()["campaign_id"]
        
        # Create second campaign
        second_campaign = campaign_create_data.copy()
        second_campaign["goal"]["goal_aim"] = "Different goal"
        response2 = client.post("/campaigns", json=second_campaign, headers=auth_headers)
        campaign_id_2 = response2.json()["campaign_id"]
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert campaign_id_1 != campaign_id_2
    
    def test_update_campaign_onboarding(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test updating campaign onboarding data (wizard step 2-4)."""
        # Setup
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Update onboarding
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=campaign_onboarding_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["campaign_id"] == campaign_id
        assert data["status"] == "onboarding_updated"
    
    def test_complete_campaign_onboarding(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test completing campaign onboarding (ready to start)."""
        # Setup
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Update onboarding
        client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=campaign_onboarding_data,
            headers=auth_headers
        )
        
        # Complete onboarding
        response = client.post(
            f"/campaigns/{campaign_id}/complete-onboarding",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert "message" in data
    
    def test_complete_onboarding_without_required_fields(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test completing onboarding without filling required fields."""
        # Setup
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Try to complete without updating onboarding
        response = client.post(
            f"/campaigns/{campaign_id}/complete-onboarding",
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "onboarding" in response.json()["detail"].lower()
