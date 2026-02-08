"""Test campaign retrieval endpoints."""
import pytest


@pytest.mark.integration
class TestCampaignRetrieval:
    """Test campaign GET endpoints (fixed model mismatch)."""
    
    def test_get_campaign_by_id(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test retrieving a specific campaign by ID."""
        # Setup
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Update onboarding so we have full data
        client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=campaign_onboarding_data,
            headers=auth_headers
        )
        
        # Get campaign
        response = client.get(f"/campaigns/{campaign_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["campaign_id"] == campaign_id
        assert "status" in data
        assert "onboarding_data" in data
        assert data["onboarding_data"]["goal"]["goal_aim"] == campaign_onboarding_data["goal_aim"]
    
    def test_get_campaign_not_found(self, client, auth_headers, phase1_profile_data):
        """Test getting non-existent campaign."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        response = client.get("/campaigns/nonexistent-id", headers=auth_headers)
        assert response.status_code == 404
    
    def test_list_campaigns(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test listing all user campaigns."""
        # Setup
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Create multiple campaigns
        campaign_ids = []
        for i in range(3):
            data = campaign_create_data.copy()
            data["goal_aim"] = f"Goal {i}"
            response = client.post("/campaigns", json=data, headers=auth_headers)
            campaign_ids.append(response.json()["campaign_id"])
        
        # List campaigns
        response = client.get("/campaigns", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        
        returned_ids = [c["campaign_id"] for c in data]
        for cid in campaign_ids:
            assert cid in returned_ids
    
    def test_list_campaigns_empty(self, client, auth_headers, phase1_profile_data):
        """Test listing campaigns when user has none."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        response = client.get("/campaigns", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json() == []
    
    @pytest.mark.skip(reason="Requires real agent execution to generate campaign plan")
    def test_get_campaign_schedule(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test retrieving campaign schedule."""
        # Setup complete campaign
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=campaign_onboarding_data,
            headers=auth_headers
        )
        client.post(f"/campaigns/{campaign_id}/complete-onboarding", headers=auth_headers)
        
        # Start campaign to generate plan
        client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        
        # Get schedule
        response = client.get(f"/campaigns/{campaign_id}/schedule", headers=auth_headers)
        
        if response.status_code != 200:
            print(f"Schedule error: {response.json()}")
        
        assert response.status_code == 200
        data = response.json()
        assert "plan" in data or "schedule" in data
