package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findByResetPasswordToken(String token);

    Optional<User> findByVerificationToken(String token);

    Optional<User> findByEmailAndPassword(String email, String password);

    Boolean existsByEmail(String email);

    Boolean existsByPhone(String phone);

    List<User> findByRole(UserRole role);

    Page<User> findByRole(UserRole role, Pageable pageable);

    List<User> findByIsActiveTrue();

    List<User> findByRoleAndIsActiveTrue(UserRole role);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailWithoutRelationships(@Param("email") String email);

    long countByIsActiveTrue();

    @Query("select function('date', u.createdAt), count(u) "
            + "from User u "
            + "where u.createdAt between :start and :end "
            + "group by function('date', u.createdAt) "
            + "order by function('date', u.createdAt)")
    List<Object[]> countUsersByDateRange(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("select function('year', u.createdAt), function('month', u.createdAt), count(u) "
            + "from User u "
            + "where u.createdAt between :start and :end "
            + "group by function('year', u.createdAt), function('month', u.createdAt) "
            + "order by function('year', u.createdAt), function('month', u.createdAt)")
    List<Object[]> countUsersByMonth(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
