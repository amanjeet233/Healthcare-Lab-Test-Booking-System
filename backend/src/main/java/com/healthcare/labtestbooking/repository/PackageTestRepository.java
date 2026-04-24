package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.PackageTest;
import com.healthcare.labtestbooking.entity.TestPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageTestRepository extends JpaRepository<PackageTest, Long> {
    List<PackageTest> findByTestPackage(TestPackage testPackage);
    List<PackageTest> findByTestPackageOrderByDisplayOrder(TestPackage testPackage);
    void deleteByTestPackageId(Long packageId);
}
