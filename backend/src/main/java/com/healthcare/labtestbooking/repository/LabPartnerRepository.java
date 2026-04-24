package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LabPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabPartnerRepository extends JpaRepository<LabPartner, Long> {

    List<LabPartner> findByCity(String city);

    List<LabPartner> findByCityIgnoreCase(String city);

    List<LabPartner> findByHomeCollectionTrue();

    List<LabPartner> findByIsActiveTrue();

    /**
     * Haversine formula: finds active labs within a given radius (km) of a lat/lng
     * point.
     * Returns results ordered by distance ascending.
     */
    @Query(value = "SELECT *, " +
            "(6371 * ACOS(COS(RADIANS(:lat)) * COS(RADIANS(latitude)) " +
            "* COS(RADIANS(longitude) - RADIANS(:lng)) " +
            "+ SIN(RADIANS(:lat)) * SIN(RADIANS(latitude)))) AS distance_km " +
            "FROM lab_partners " +
            "WHERE is_active = true " +
            "AND latitude IS NOT NULL AND longitude IS NOT NULL " +
            "HAVING distance_km <= :radiusKm " +
            "ORDER BY distance_km ASC", nativeQuery = true)
    List<Object[]> findNearbyLabs(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm);
}
