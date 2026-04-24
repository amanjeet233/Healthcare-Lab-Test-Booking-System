package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    Optional<LoginAttempt> findByEmail(String email);

    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.email = :email")
    void deleteByEmail(String email);

    boolean existsByEmail(String email);
}
