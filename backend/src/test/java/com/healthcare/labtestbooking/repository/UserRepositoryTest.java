package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_ReturnsUser_WhenUserExists() {
        // Given
        User user = createUser("john@example.com", "John Doe", UserRole.PATIENT);
        entityManager.persistAndFlush(user);

        // When
        Optional<User> foundUser = userRepository.findByEmail("john@example.com");

        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("john@example.com");
        assertThat(foundUser.get().getName()).isEqualTo("John Doe");
    }

    @Test
    void findByEmail_ReturnsEmpty_WhenUserDoesNotExist() {
        // When
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(foundUser).isEmpty();
    }

    @Test
    void existsByEmail_ReturnsTrue_WhenEmailExists() {
        // Given
        User user = createUser("test@example.com", "Test User", UserRole.PATIENT);
        entityManager.persistAndFlush(user);

        // When
        Boolean exists = userRepository.existsByEmail("test@example.com");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void existsByEmail_ReturnsFalse_WhenEmailDoesNotExist() {
        // When
        Boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void existsByPhone_ReturnsTrue_WhenPhoneExists() {
        // Given
        User user = createUser("test@example.com", "Test User", UserRole.PATIENT);
        user.setPhone("1234567890");
        entityManager.persistAndFlush(user);

        // When
        Boolean exists = userRepository.existsByPhone("1234567890");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void existsByPhone_ReturnsFalse_WhenPhoneDoesNotExist() {
        // When
        Boolean exists = userRepository.existsByPhone("9999999999");

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void findByRole_ReturnsUsers_WithMatchingRole() {
        // Given
        User patient1 = createUser("patient1@example.com", "Patient 1", UserRole.PATIENT);
        User patient2 = createUser("patient2@example.com", "Patient 2", UserRole.PATIENT);
        User technician = createUser("tech@example.com", "Tech", UserRole.TECHNICIAN);
        
        entityManager.persist(patient1);
        entityManager.persist(patient2);
        entityManager.persist(technician);
        entityManager.flush();

        // When
        List<User> patients = userRepository.findByRole(UserRole.PATIENT);

        // Then
        assertThat(patients).hasSize(2);
        assertThat(patients).extracting(User::getEmail)
                .containsExactlyInAnyOrder("patient1@example.com", "patient2@example.com");
    }

    @Test
    void findByRole_ReturnsEmpty_WhenNoUsersWithRole() {
        // When
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);

        // Then
        assertThat(admins).isEmpty();
    }

    @Test
    void findByIsActiveTrue_ReturnsOnlyActiveUsers() {
        // Given
        User activeUser = createUser("active@example.com", "Active User", UserRole.PATIENT);
        activeUser.setIsActive(true);
        
        User inactiveUser = createUser("inactive@example.com", "Inactive User", UserRole.PATIENT);
        inactiveUser.setIsActive(false);
        
        entityManager.persist(activeUser);
        entityManager.persist(inactiveUser);
        entityManager.flush();

        // When
        List<User> activeUsers = userRepository.findByIsActiveTrue();

        // Then
        assertThat(activeUsers).hasSize(1);
        assertThat(activeUsers.get(0).getEmail()).isEqualTo("active@example.com");
    }

    @Test
    void findByRoleAndIsActiveTrue_ReturnsActiveUsersWithRole() {
        // Given
        User activePatient = createUser("active@example.com", "Active Patient", UserRole.PATIENT);
        activePatient.setIsActive(true);
        
        User inactivePatient = createUser("inactive@example.com", "Inactive Patient", UserRole.PATIENT);
        inactivePatient.setIsActive(false);
        
        User activeTech = createUser("tech@example.com", "Active Tech", UserRole.TECHNICIAN);
        activeTech.setIsActive(true);
        
        entityManager.persist(activePatient);
        entityManager.persist(inactivePatient);
        entityManager.persist(activeTech);
        entityManager.flush();

        // When
        List<User> activePatients = userRepository.findByRoleAndIsActiveTrue(UserRole.PATIENT);

        // Then
        assertThat(activePatients).hasSize(1);
        assertThat(activePatients.get(0).getEmail()).isEqualTo("active@example.com");
    }

    @Test
    void save_PersistsUserSuccessfully() {
        // Given
        User user = createUser("newuser@example.com", "New User", UserRole.PATIENT);
        user.setPhone("9876543210");
        user.setAddress("123 New Street");
        user.setDateOfBirth(LocalDate.of(1990, 1, 1));
        user.setGender(Gender.MALE);
        user.setBloodGroup("O+");

        // When
        User savedUser = userRepository.save(user);

        // Then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo("newuser@example.com");
        assertThat(savedUser.getPhone()).isEqualTo("9876543210");
        assertThat(savedUser.getAddress()).isEqualTo("123 New Street");
        assertThat(savedUser.getDateOfBirth()).isEqualTo(LocalDate.of(1990, 1, 1));
        assertThat(savedUser.getGender()).isEqualTo(Gender.MALE);
        assertThat(savedUser.getBloodGroup()).isEqualTo("O+");
    }

    @Test
    void findById_ReturnsUser_WhenUserExists() {
        // Given
        User user = createUser("test@example.com", "Test User", UserRole.PATIENT);
        User savedUser = entityManager.persistAndFlush(user);

        // When
        Optional<User> foundUser = userRepository.findById(savedUser.getId());

        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getId()).isEqualTo(savedUser.getId());
    }

    @Test
    void findById_ReturnsEmpty_WhenUserDoesNotExist() {
        // When
        Optional<User> foundUser = userRepository.findById(999L);

        // Then
        assertThat(foundUser).isEmpty();
    }

    @Test
    void deleteById_RemovesUser() {
        // Given
        User user = createUser("todelete@example.com", "To Delete", UserRole.PATIENT);
        User savedUser = entityManager.persistAndFlush(user);

        // When
        userRepository.deleteById(savedUser.getId());
        entityManager.flush();

        // Then
        Optional<User> foundUser = userRepository.findById(savedUser.getId());
        assertThat(foundUser).isEmpty();
    }

    @Test
    void findAll_ReturnsAllUsers() {
        // Given
        User user1 = createUser("user1@example.com", "User 1", UserRole.PATIENT);
        User user2 = createUser("user2@example.com", "User 2", UserRole.TECHNICIAN);
        User user3 = createUser("user3@example.com", "User 3", UserRole.ADMIN);
        
        entityManager.persist(user1);
        entityManager.persist(user2);
        entityManager.persist(user3);
        entityManager.flush();

        // When
        List<User> allUsers = userRepository.findAll();

        // Then
        assertThat(allUsers).hasSize(3);
        assertThat(allUsers).extracting(User::getEmail)
                .contains("user1@example.com", "user2@example.com", "user3@example.com");
    }

    @Test
    void count_ReturnsCorrectCount() {
        // Given
        User user1 = createUser("user1@example.com", "User 1", UserRole.PATIENT);
        User user2 = createUser("user2@example.com", "User 2", UserRole.PATIENT);
        
        entityManager.persist(user1);
        entityManager.persist(user2);
        entityManager.flush();

        // When
        long count = userRepository.count();

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    void findByEmailAndPassword_ReturnsUser_WhenCredentialsMatch() {
        // Given
        User user = createUser("test@example.com", "Test User", UserRole.PATIENT);
        user.setPassword("encodedPassword123");
        entityManager.persistAndFlush(user);

        // When
        Optional<User> foundUser = userRepository.findByEmailAndPassword("test@example.com", "encodedPassword123");

        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void findByEmailAndPassword_ReturnsEmpty_WhenEmailDoesNotMatch() {
        // Given
        User user = createUser("test@example.com", "Test User", UserRole.PATIENT);
        user.setPassword("encodedPassword123");
        entityManager.persistAndFlush(user);

        // When
        Optional<User> foundUser = userRepository.findByEmailAndPassword("wrong@example.com", "encodedPassword123");

        // Then
        assertThat(foundUser).isEmpty();
    }

    @Test
    void findByEmailAndPassword_ReturnsEmpty_WhenPasswordDoesNotMatch() {
        // Given
        User user = createUser("test@example.com", "Test User", UserRole.PATIENT);
        user.setPassword("encodedPassword123");
        entityManager.persistAndFlush(user);

        // When
        Optional<User> foundUser = userRepository.findByEmailAndPassword("test@example.com", "wrongPassword");

        // Then
        assertThat(foundUser).isEmpty();
    }

    @Test
    void save_UpdatesExistingUser() {
        // Given
        User user = createUser("test@example.com", "Original Name", UserRole.PATIENT);
        User savedUser = entityManager.persistAndFlush(user);

        // When
        savedUser.setName("Updated Name");
        savedUser.setPhone("1111111111");
        User updatedUser = userRepository.save(savedUser);

        // Then
        assertThat(updatedUser.getName()).isEqualTo("Updated Name");
        assertThat(updatedUser.getPhone()).isEqualTo("1111111111");
        
        // Verify in database
        Optional<User> foundUser = userRepository.findById(savedUser.getId());
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getName()).isEqualTo("Updated Name");
    }

    private User createUser(String email, String name, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole(role);
        user.setPassword("encodedPassword");
        user.setIsActive(true);
        return user;
    }
}