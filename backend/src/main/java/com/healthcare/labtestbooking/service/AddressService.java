package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.AddressDTO;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.UserAddress;
import com.healthcare.labtestbooking.repository.UserAddressRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressDTO> getAllAddresses() {
        User user = getCurrentUser();
        return addressRepository.findByUserId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDTO saveAddress(AddressDTO dto) {
        User user = getCurrentUser();
        UserAddress address;

        if (dto.getId() != null) {
            // Update existing
            address = addressRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Address not found"));
            
            // Security check: ensure address belongs to user
            if (!address.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to update this address");
            }
        } else {
            // Create new
            address = new UserAddress();
            address.setUser(user);
        }

        address.setLabel(dto.getLabel());
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setCountry(dto.getCountry());
        address.setPostalCode(dto.getPostalCode());
        address.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            resetDefaultAddresses(user.getId());
        }

        return mapToDTO(addressRepository.save(address));
    }

    @Transactional
    public AddressDTO updateAddress(Long id, AddressDTO dto) {
        dto.setId(id);
        return saveAddress(dto);
    }

    @Transactional
    public void deleteAddress(Long id) {
        User user = getCurrentUser();
        UserAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this address");
        }

        List<UserAddress> userAddresses = addressRepository.findByUserId(user.getId());
        if (userAddresses.size() <= 1) {
            throw new RuntimeException("Cannot delete the only saved address");
        }

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            throw new RuntimeException("Cannot delete primary address directly. Set another default first.");
        }

        addressRepository.delete(address);
    }

    private void resetDefaultAddresses(Long userId) {
        List<UserAddress> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(a -> a.setIsDefault(false));
        addressRepository.saveAll(addresses);
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private AddressDTO mapToDTO(UserAddress address) {
        return AddressDTO.builder()
                .id(address.getId())
                .label(address.getLabel())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .build();
    }
}
