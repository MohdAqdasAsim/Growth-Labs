"""Test onboarding endpoints (Phase 1 - 4 fields)."""
import pytest


@pytest.mark.integration
class TestOnboarding:
    """Test Phase 1 onboarding flow (4 fields only)."""
    
    def test_submit_phase1_success(self, client, auth_headers, phase1_profile_data):
        """Test successful Phase 1 onboarding submission."""
        response = client.post(
            "/onboarding",
            json=phase1_profile_data,  # Now sends JSON body with 4 fields
            headers=auth_headers
        )
        
        assert response.status_code == 201  # Fixed: API returns 201 Created
        data = response.json()
        
        # Verify profile fields (API returns CreatorProfile directly)
        assert data["user_name"] == phase1_profile_data["user_name"]
        assert data["creator_type"] == phase1_profile_data["creator_type"]
        assert data["niche"] == phase1_profile_data["niche"]
        assert data["target_audience_niche"] == phase1_profile_data["target_audience_niche"]
        assert "user_id" in data
    
    def test_submit_phase1_requires_auth(self, client, phase1_profile_data):
        """Test that Phase 1 submission requires authentication."""
        response = client.post("/onboarding", json=phase1_profile_data)
        assert response.status_code == 403  # Fixed: API returns 403, not 401
    
    def test_submit_phase1_missing_fields(self, client, auth_headers):
        """Test Phase 1 submission with missing required fields."""
        incomplete_data = {
            "user_name": "Test",
            # Missing other required fields
        }
        response = client.post(
            "/onboarding",
            json=incomplete_data,
            headers=auth_headers
        )
        assert response.status_code == 422  # Validation error
    
    def test_get_profile_before_onboarding(self, client, auth_headers):
        """Test retrieving profile before completing onboarding."""
        response = client.get("/onboarding", headers=auth_headers)  # Fixed: use /onboarding GET endpoint
        
        # Should return 404 before onboarding
        assert response.status_code == 404
    
    def test_get_profile_after_phase1(self, client, auth_headers, phase1_profile_data):
        """Test retrieving profile after Phase 1 completion."""
        # Submit Phase 1
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Get profile
        response = client.get("/onboarding", headers=auth_headers)  # Fixed: use /onboarding GET endpoint
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_name"] == phase1_profile_data["user_name"]
        assert data["niche"] == phase1_profile_data["niche"]
    
    def test_get_profile_completion_status_initial(self, client, auth_headers):
        """Test profile completion status before any submission."""
        response = client.get("/profile/completion", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["phase1_complete"] is False
        assert data["phase2_complete"] is False
    
    def test_get_profile_completion_status_after_phase1(self, client, auth_headers, phase1_profile_data):
        """Test profile completion status after Phase 1."""
        # Complete Phase 1
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        response = client.get("/profile/completion", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["phase1_complete"] is True
        assert data["phase2_complete"] is False
        assert "completion_percentage" in data
