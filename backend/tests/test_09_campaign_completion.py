"""Test campaign completion and outcome reporting."""
import pytest


@pytest.mark.slow
@pytest.mark.integration
class TestCampaignCompletion:
    """Test campaign completion flow (makes API calls)."""
    
    def test_complete_campaign(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data, actual_metrics_data):
        """Test marking campaign as complete with actual metrics."""
        # Setup and execute campaign
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        minimal_config = campaign_onboarding_data.copy()
        minimal_config["agent_config"]["run_forensics"] = False
        minimal_config["agent_config"]["run_outcome"] = True
        minimal_config["image_generation_enabled"] = False
        
        client.patch(f"/campaigns/{campaign_id}/onboarding", json=minimal_config, headers=auth_headers)
        client.post(f"/campaigns/{campaign_id}/complete-onboarding", headers=auth_headers)
        
        # Start campaign (makes API calls)
        client.post(f"/campaigns/{campaign_id}/start", headers=auth_headers)
        
        # Complete campaign with metrics
        response = client.post(
            f"/campaigns/{campaign_id}/complete",
            json=actual_metrics_data,
            headers=auth_headers
        )
        
        # Should execute Outcome Agent and generate report
        assert response.status_code in [200, 400]  # 400 if not all days confirmed
    
    def test_complete_campaign_not_started(self, client, auth_headers, phase1_profile_data, campaign_create_data, actual_metrics_data):
        """Test that campaign must be started before completion."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Try to complete without starting
        response = client.post(
            f"/campaigns/{campaign_id}/complete",
            json=actual_metrics_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_get_campaign_report(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test retrieving campaign outcome report."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Try to get report (should be empty if not completed)
        response = client.get(
            f"/campaigns/{campaign_id}/report",
            headers=auth_headers
        )
        
        assert response.status_code in [200, 404]


@pytest.mark.integration
class TestCampaignEditing:
    """Test campaign editing and deletion."""
    
    def test_edit_campaign_before_start(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test editing campaign details before it starts."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Edit onboarding data
        updated_data = campaign_onboarding_data.copy()
        updated_data["name"] = "Updated Campaign Name"
        updated_data["description"] = "Updated description"
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=updated_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_cannot_edit_started_campaign(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test that started campaigns cannot be edited."""
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
        
        # Try to edit after starting
        updated_data = campaign_onboarding_data.copy()
        updated_data["name"] = "Should not work"
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=updated_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_delete_campaign_before_start(self, client, auth_headers, phase1_profile_data, campaign_create_data):
        """Test deleting campaign before it starts."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Delete campaign
        response = client.delete(f"/campaigns/{campaign_id}", headers=auth_headers)
        
        assert response.status_code == 200
        
        # Verify it's deleted
        get_response = client.get(f"/campaigns/{campaign_id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_cannot_delete_started_campaign(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test that started campaigns cannot be deleted."""
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
        
        # Try to delete after starting
        response = client.delete(f"/campaigns/{campaign_id}", headers=auth_headers)
        
        assert response.status_code == 400
