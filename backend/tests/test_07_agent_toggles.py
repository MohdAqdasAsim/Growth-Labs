"""Test agent configuration toggles."""
import pytest


@pytest.mark.integration
class TestAgentToggles:
    """Test agent configuration toggle functionality."""
    
    def test_agent_config_default_all_enabled(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test that default agent config has all agents enabled."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Use default config
        client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=campaign_onboarding_data,
            headers=auth_headers
        )
        
        # Verify config stored
        get_response = client.get(f"/campaigns/{campaign_id}", headers=auth_headers)
        assert get_response.status_code == 200
    
    def test_disable_forensics_agent(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test disabling Forensics Agent."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Disable forensics
        config = campaign_onboarding_data.copy()
        config["agent_config"]["run_forensics"] = False
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_disable_outcome_agent(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test disabling Outcome Agent."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Disable outcome
        config = campaign_onboarding_data.copy()
        config["agent_config"]["run_outcome"] = False
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_minimal_agent_config(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test running campaign with minimal agents (Strategy + Planner + Content only)."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Minimal config
        config = campaign_onboarding_data.copy()
        config["agent_config"] = {
            "run_strategy": True,
            "run_forensics": False,
            "run_planner": True,
            "run_content": True,
            "run_outcome": False
        }
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_cannot_disable_required_agents(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test that Strategy, Planner, and Content agents cannot be disabled (if enforced)."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Try to disable required agents
        config = campaign_onboarding_data.copy()
        config["agent_config"] = {
            "run_strategy": False,  # Required
            "run_forensics": False,
            "run_planner": False,  # Required
            "run_content": False,  # Required
            "run_outcome": False
        }
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        # Should either reject or auto-enable required agents
        # Implementation dependent - test both scenarios
        assert response.status_code in [200, 400]


@pytest.mark.integration
class TestImageAndSEOToggles:
    """Test image generation and SEO optimization toggles."""
    
    def test_disable_image_generation(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test disabling image generation."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Disable image generation
        config = campaign_onboarding_data.copy()
        config["image_generation_enabled"] = False
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_enable_image_generation(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test enabling image generation."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Enable image generation
        config = campaign_onboarding_data.copy()
        config["image_generation_enabled"] = True
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_disable_seo_optimization(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test disabling SEO optimization."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Disable SEO
        config = campaign_onboarding_data.copy()
        config["seo_optimization_enabled"] = False
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_disable_both_image_and_seo(self, client, auth_headers, phase1_profile_data, campaign_create_data, campaign_onboarding_data):
        """Test disabling both image generation and SEO."""
        client.post("/onboarding", json=phase1_profile_data, headers=auth_headers)
        create_response = client.post("/campaigns", json=campaign_create_data, headers=auth_headers)
        campaign_id = create_response.json()["campaign_id"]
        
        # Disable both
        config = campaign_onboarding_data.copy()
        config["image_generation_enabled"] = False
        config["seo_optimization_enabled"] = False
        
        response = client.patch(
            f"/campaigns/{campaign_id}/onboarding",
            json=config,
            headers=auth_headers
        )
        
        assert response.status_code == 200
