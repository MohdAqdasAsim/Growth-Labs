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
        response = client.patch("/profile", json=phase2_profile_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["youtube_channel_url"] == phase2_profile_data["youtube_channel_url"]
        assert data["twitter_handle"] == phase2_profile_data["twitter_handle"]
        assert data["past_campaigns"] == phase2_profile_data["past_campaigns"]
    
    def test_update_phase2_without_phase1(self, client, auth_headers, phase2_profile_data):
        """Test that Phase 2 update requires Phase 1 completion."""
        response = client.patch("/profile", json=phase2_profile_data, headers=auth_headers)
        
        # Should fail or warn that Phase 1 must be complete first
        assert response.status_code in [400, 403, 422]
    
    def test_update_phase2_partial_fields(self, client, auth_headers, phase1_profile_data):
        """Test updating only some Phase 2 fields."""
        # Complete Phase 1
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Update only a few fields
        partial_data = {
            "youtube_channel_url": "https://youtube.com/@newchannel",
            "tools_used": "Adobe Premiere, Notion"
        }
        
        response = client.patch("/profile", json=partial_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["youtube_channel_url"] == partial_data["youtube_channel_url"]
        assert data["tools_used"] == partial_data["tools_used"]
    
    def test_get_profile_after_phase2(self, client, auth_headers, phase1_profile_data, phase2_profile_data):
        """Test retrieving complete profile after Phase 2."""
        # Complete Phase 1
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        
        # Complete Phase 2
        client.patch("/profile", json=phase2_profile_data, headers=auth_headers)
        
        # Get complete profile
        response = client.get("/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["phase1_complete"] is True
        assert data["phase2_complete"] is True
        assert data["niche"] == phase1_profile_data["niche"]
        assert data["youtube_channel_url"] == phase2_profile_data["youtube_channel_url"]
    
    def test_profile_completion_percentage(self, client, auth_headers, phase1_profile_data, phase2_profile_data):
        """Test profile completion percentage calculation."""
        # Initial state - 0%
        response = client.get("/profile/completion", headers=auth_headers)
        assert response.json()["completion_percentage"] == 0.0
        
        # After Phase 1 - should be ~31% (5/16 fields)
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        response = client.get("/profile/completion", headers=auth_headers)
        completion = response.json()["completion_percentage"]
        assert completion > 0 and completion < 50
        
        # After Phase 2 - should be 100%
        client.patch("/profile", json=phase2_profile_data, headers=auth_headers)
        response = client.get("/profile/completion", headers=auth_headers)
        assert response.json()["completion_percentage"] == 100.0
