"""
QUANTUMON Quantum Lab & Kernel Service
Implements genuine Qiskit quantum feature maps (zz_feature_map, z_feature_map, pauli_feature_map),
Statevector Fidelity Quantum Kernels, circuit resource analysis,
and circuit diagram generation. Fully compatible with Qiskit 1.x and 2.x.
"""
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import time

try:
    import qiskit
    from qiskit import QuantumCircuit
    try:
        from qiskit.circuit.library import zz_feature_map, z_feature_map, pauli_feature_map
    except ImportError:
        from qiskit.circuit.library import ZZFeatureMap as zz_feature_map
        from qiskit.circuit.library import ZFeatureMap as z_feature_map
        from qiskit.circuit.library import PauliFeatureMap as pauli_feature_map

    from qiskit.quantum_info import Statevector
    QISKIT_AVAILABLE = True
    QISKIT_VERSION = qiskit.__version__
except ImportError:
    QISKIT_AVAILABLE = False
    QISKIT_VERSION = "Not installed"


class QuantumKernelService:
    def __init__(self):
        self.qiskit_available = QISKIT_AVAILABLE
        self.qiskit_version = QISKIT_VERSION

    def build_feature_map(
        self,
        feature_dimension: int,
        feature_map_type: str = "ZZFeatureMap",
        reps: int = 2,
        entanglement: str = "linear"
    ) -> Any:
        """
        Build genuine Qiskit quantum feature map circuit.
        Supported: ZZFeatureMap, ZFeatureMap, PauliFeatureMap
        """
        if not self.qiskit_available:
            raise RuntimeError("Qiskit is not available in the current Python environment.")

        n_qubits = int(feature_dimension)

        if feature_map_type == "ZZFeatureMap":
            return zz_feature_map(
                feature_dimension=n_qubits,
                reps=reps,
                entanglement=entanglement
            )
        elif feature_map_type == "ZFeatureMap":
            return z_feature_map(
                feature_dimension=n_qubits,
                reps=reps
            )
        elif feature_map_type == "PauliFeatureMap":
            return pauli_feature_map(
                feature_dimension=n_qubits,
                reps=reps,
                paulis=['Z', 'ZZ'],
                entanglement=entanglement
            )
        else:
            return zz_feature_map(feature_dimension=n_qubits, reps=reps, entanglement=entanglement)

    def analyze_circuit(
        self,
        feature_dimension: int,
        feature_map_type: str = "ZZFeatureMap",
        reps: int = 2,
        entanglement: str = "linear"
    ) -> Dict[str, Any]:
        """
        Extract quantum circuit depth, gate counts, two-qubit gate counts,
        parameter count, and visual text diagram representation.
        """
        if not self.qiskit_available:
            return {
                "error": "Qiskit is not installed",
                "qiskit_available": False
            }

        fmap = self.build_feature_map(
            feature_dimension=feature_dimension,
            feature_map_type=feature_map_type,
            reps=reps,
            entanglement=entanglement
        )

        decomposed = fmap.decompose()
        depth = int(decomposed.depth())
        num_qubits = int(fmap.num_qubits)
        num_parameters = int(fmap.num_parameters)
        
        ops_dict = dict(decomposed.count_ops())
        two_qubit_gates = sum(ops_dict.get(g, 0) for g in ['cx', 'cz', 'swap', 'rzz', 'cp'])
        single_qubit_gates = sum(ops_dict.get(g, 0) for g in ['h', 'rz', 'rx', 'ry', 'p', 'u1', 'u2', 'u3', 'x', 'y', 'z'])
        total_gates = sum(ops_dict.values())

        try:
            circuit_text = str(decomposed.draw(output='text'))
        except Exception:
            circuit_text = str(fmap)

        gate_elements = []
        try:
            for instruction in decomposed.data:
                gate_name = instruction.operation.name
                q_indices = [decomposed.find_bit(q).index for q in instruction.qubits]
                params = [float(p) if isinstance(p, (int, float)) else str(p) for p in instruction.operation.params]
                gate_elements.append({
                    "gate": gate_name,
                    "qubits": q_indices,
                    "params": params
                })
        except Exception:
            pass

        return {
            "num_qubits": num_qubits,
            "feature_dimension": feature_dimension,
            "feature_map_type": feature_map_type,
            "reps": reps,
            "entanglement": entanglement,
            "depth": depth,
            "num_parameters": num_parameters,
            "total_gates": total_gates,
            "two_qubit_gates": two_qubit_gates,
            "single_qubit_gates": single_qubit_gates,
            "gate_counts": ops_dict,
            "circuit_ascii": circuit_text,
            "gate_elements": gate_elements[:60],
            "qiskit_version": self.qiskit_version
        }

    def compute_quantum_statevectors(
        self,
        X: np.ndarray,
        feature_map_type: str = "ZZFeatureMap",
        reps: int = 2,
        entanglement: str = "linear",
        alpha: float = 2.0
    ) -> Tuple[np.ndarray, float]:
        """
        Compute statevector representation for each sample x in X using Qiskit.
        Returns:
            states_matrix: (N, 2^n) complex numpy array
            runtime_seconds: elapsed time
        """
        if not self.qiskit_available:
            raise RuntimeError("Qiskit not installed")

        t_start = time.perf_counter()
        n_samples, n_qubits = X.shape

        fmap = self.build_feature_map(
            feature_dimension=n_qubits,
            feature_map_type=feature_map_type,
            reps=reps,
            entanglement=entanglement
        )

        dim = 2 ** n_qubits
        statevectors = np.zeros((n_samples, dim), dtype=np.complex128)

        # Pre-extract circuit parameters in order
        param_list = list(fmap.parameters)

        for i in range(n_samples):
            # Scale values with alpha and ensure clean python float list
            vals = [float(v) * alpha for v in X[i, :]]
            param_dict = dict(zip(param_list, vals))
            bound_circuit = fmap.assign_parameters(param_dict)
            sv = Statevector.from_instruction(bound_circuit)
            statevectors[i, :] = sv.data

        elapsed = time.perf_counter() - t_start
        return statevectors, elapsed

    def compute_fidelity_kernel_matrix(
        self,
        X1: np.ndarray,
        X2: Optional[np.ndarray] = None,
        feature_map_type: str = "ZZFeatureMap",
        reps: int = 2,
        entanglement: str = "linear",
        alpha: float = 2.0
    ) -> Dict[str, Any]:
        """
        Compute genuine Fidelity Quantum Kernel matrix:
        K(x_i, x_j) = |<psi(x_i)|psi(x_j)>|^2
        For symmetric train matrix (X1 == X2): K = |S1 @ S1.conj().T|^2
        For test matrix: K = |S1 @ S2.conj().T|^2
        """
        is_symmetric = (X2 is None)
        t_start = time.perf_counter()

        S1, _ = self.compute_quantum_statevectors(
            X1, feature_map_type=feature_map_type, reps=reps, entanglement=entanglement, alpha=alpha
        )

        if is_symmetric:
            overlap = np.dot(S1, S1.conj().T)
            K = np.abs(overlap) ** 2
            np.fill_diagonal(K, 1.0)
        else:
            S2, _ = self.compute_quantum_statevectors(
                X2, feature_map_type=feature_map_type, reps=reps, entanglement=entanglement, alpha=alpha
            )
            overlap = np.dot(S1, S2.conj().T)
            K = np.abs(overlap) ** 2

        elapsed = time.perf_counter() - t_start

        diag_mean = float(np.mean(np.diag(K))) if is_symmetric else 1.0
        off_diag_vals = K[~np.eye(K.shape[0], dtype=bool)] if (is_symmetric and K.shape[0] > 1) else K.flatten()
        off_diag_mean = float(np.mean(off_diag_vals))
        off_diag_std = float(np.std(off_diag_vals))
        off_diag_min = float(np.min(off_diag_vals))
        off_diag_max = float(np.max(off_diag_vals))

        concentration_warning = None
        if off_diag_std < 0.015 and len(off_diag_vals) > 10:
            concentration_warning = "Kernel concentration detected (very low matrix variance). Samples may be mapped to nearly orthogonal or identical quantum states. Consider tuning reps or alpha."

        return {
            "kernel_matrix": K.round(5).tolist(),
            "shape": list(K.shape),
            "is_symmetric": is_symmetric,
            "runtime_seconds": round(elapsed, 4),
            "total_evaluations": K.shape[0] * K.shape[1],
            "stats": {
                "diagonal_mean": diag_mean,
                "off_diagonal_mean": round(off_diag_mean, 4),
                "off_diagonal_std": round(off_diag_std, 4),
                "min_fidelity": round(off_diag_min, 4),
                "max_fidelity": round(off_diag_max, 4)
            },
            "concentration_warning": concentration_warning,
            "feature_map": {
                "type": feature_map_type,
                "qubits": X1.shape[1],
                "reps": reps,
                "entanglement": entanglement,
                "alpha": alpha
            }
        }
