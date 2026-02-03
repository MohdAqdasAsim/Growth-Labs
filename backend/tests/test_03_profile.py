"""Test profile management endpoints (Phase 2 - 11 fields)."""
import pytest


@pytest.mark.integration
class TestProfile:
    """Test Phase 2 profile management (separate from onboarding)."""
    
    def test_update_phase2_profile(self, client, auth_headers, phase1_profile_data, phase2_profile_data):
        """Test updating Phase 2 profile fields."""
        # Complete Phase 1 first
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Update Phase 2 fields
        response = client.patch("/profile/phase2", json=phase2_profile_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["unique_angle"] == phase2_profile_data["unique_angle"]
        assert data["content_mission"] == phase2_profile_data["content_mission"]
        assert data["tools_skills"] == phase2_profile_data["tools_skills"]
    
    def test_update_phase2_without_phase1(self, client, auth_headers, phase2_profile_data):
        """Test that Phase 2 update requires Phase 1 completion."""
        response = client.patch("/profile/phase2", json=phase2_profile_data, headers=auth_headers)
        
        # Should return 404 since profile doesn't exist
        assert response.status_code == 404
    
    def test_update_phase2_partial_fields(self, client, auth_headers, phase1_profile_data):
        """Test updating only some Phase 2 fields."""
        # Complete Phase 1
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Update only a few fields
        partial_data = {
            "unique_angle": "Teaching through real-world projects",
            "tools_skills": ["Adobe Premiere", "Notion"]
        }
        
        response = client.patch("/profile/phase2", json=partial_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["unique_angle"] == partial_data["unique_angle"]
        assert data["tools_skills"] == partial_data["tools_skills"]
    
    def test_get_profile_after_phase2(self, client, auth_headers, phase1_profile_data, phase2_profile_data):
        """Test retrieving complete profile after Phase 2."""
        # Complete Phase 1
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Complete Phase 2
        client.patch("/profile/phase2", json=phase2_profile_data, headers=auth_headers)
        
        # Get complete profile (returns CreatorProfile model)
        response = client.get("/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        # Verify Phase 1 fields
        assert data["niche"] == phase1_profile_data["niche"]
        assert data["user_name"] == phase1_profile_data["user_name"]
        # Verify Phase 2 fields
        assert data["unique_angle"] == phase2_profile_data["unique_angle"]
        assert data["content_mission"] == phase2_profile_data["content_mission"]
    
    def test_profile_completion_percentage(self, client, auth_headers, phase1_profile_data, phase2_profile_data):
        """Test profile completion percentage calculation."""
        # Initial state - 0%
        response = client.get("/profile/completion", headers=auth_headers)
        assert response.json()["completion_percentage"] == 0.0
        
        # After Phase 1 - Phase 2 fields are 0% filled
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        response = client.get("/profile/completion", headers=auth_headers)
        assert response.status_code == 200
        # Phase 1 complete but Phase 2 is 0% (calculation is Phase 2 only)
        
        # After Phase 2 - should be 100%
        client.patch("/profile/phase2", json=phase2_profile_data, headers=auth_headers)
        response = client.get("/profile/completion", headers=auth_headers)
        assert response.json()["completion_percentage"] == 100.0
        assert response.json()["phase2_complete"] is True
