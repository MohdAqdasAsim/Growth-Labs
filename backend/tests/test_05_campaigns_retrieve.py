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
        assert "goal" in data  # Fixed: Now properly maps from campaign.onboarding.goal
        assert "target_platforms" in data
    
    def test_get_campaign_not_found(self, client, auth_headers, phase1_profile_data):
        """Test getting non-existent campaign."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        response = client.get("/campaigns/nonexistent-id", headers=auth_headers)
        assert response.status_code == 404
    
    def test_get_campaign_unauthorized(self, client, test_user_data, phase1_profile_data, campaign_create_data):
        """Test that users can't access other users' campaigns."""
        # Create first user and campaign
        client.post("/auth/register", json=test_user_data)
        login_response = client.post("/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token1 = login_response.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        client.post("/onboarding", json=phase1_profile_data, headers=headers1)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=headers1)
        campaign_id = create_response.json()["campaign_id"]
        
        # Create second user
        user2_data = test_user_data.copy()
        user2_data["email"] = "user2@example.com"
        client.post("/auth/register", json=user2_data)
        login_response2 = client.post("/auth/login", json={
            "email": user2_data["email"],
            "password": user2_data["password"]
        })
        token2 = login_response2.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # Try to access first user's campaign
        response = client.get(f"/campaigns/{campaign_id}", headers=headers2)
        assert response.status_code == 403
    
    def test_list_campaigns(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test listing all user campaigns."""
        # Setup
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Create multiple campaigns
        campaign_ids = []
        for i in range(3):
            data = campaign_create_data.copy()
            data["goal"]["goal_aim"] = f"Goal {i}"
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
        
        # Get schedule
        response = client.get(f"/campaigns/{campaign_id}/schedule", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "plan" in data or "schedule" in data
